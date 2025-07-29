'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Order {
    id: string;
    customerId: string;
    driverId?: string;
    pickupLocation: string;
    dropoffLocation: string;
    packageType: string;
    price: number;
    status: 'pending' | 'accepted' | 'heading_to_pickup' | 'package_collected' | 'in_transit' | 'delivered';
    createdAt: string;
    scheduledDate?: string;
    scheduledTime?: string;
    customerName: string;
    customerPhone: string;
    specialInstructions?: string;
    urgent: boolean;
}

interface OrderContextType {
    orders: Order[];
    createOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => string;
    updateOrderStatus: (orderId: string, status: Order['status'], driverId?: string) => void;
    getOrdersByDriver: (driverId: string) => Order[];
    getOrdersByCustomer: (customerId: string) => Order[];
    getAvailableOrders: () => Order[];
    acceptOrder: (orderId: string, driverId: string) => boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([
        // Test orders
        {
            id: 'order_1',
            customerId: 'customer_1',
            driverId: 'driver_1',
            pickupLocation: 'Warsaw, ul. Marszałkowska 100',
            dropoffLocation: 'Kraków, ul. Główny Rynek 1',
            packageType: 'Medium Package',
            price: 85,
            status: 'package_collected',
            createdAt: '2024-01-15T09:00:00',
            customerName: 'Jan Kowalski',
            customerPhone: '+48 123 456 789',
            specialInstructions: 'Fragile items, handle with care',
            urgent: false
        },
        {
            id: 'order_2',
            customerId: 'customer_2',
            driverId: 'driver_1',
            pickupLocation: 'Gdańsk, ul. Długa 20',
            dropoffLocation: 'Gdańsk, ul. Westerplatte 15',
            packageType: 'Small Package',
            price: 30,
            status: 'heading_to_pickup',
            createdAt: '2024-01-15T11:00:00',
            customerName: 'Maria Nowak',
            customerPhone: '+48 987 654 321',
            urgent: false
        },
        {
            id: 'order_3',
            customerId: 'customer_3',
            pickupLocation: 'Kraków, ul. Floriańska 12',
            dropoffLocation: 'Kraków, ul. Karmelicka 45',
            packageType: 'Small Package',
            price: 25,
            status: 'pending',
            createdAt: '2024-01-15T12:00:00',
            customerName: 'Anna Kowalczyk',
            customerPhone: '+48 555 666 777',
            urgent: true
        }
    ]);

    const createOrder = (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): string => {
        const newOrder: Order = {
            ...orderData,
            id: `order_${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        setOrders(prev => [...prev, newOrder]);

        // Simulate notification to matching drivers
        console.log('🔔 New order created:', newOrder.id);
        console.log('📍 Route:', orderData.pickupLocation, '→', orderData.dropoffLocation);

        return newOrder.id;
    };

    const updateOrderStatus = (orderId: string, status: Order['status'], driverId?: string) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, status, ...(driverId && { driverId }) }
                    : order
            )
        );

        console.log('📊 Order status updated:', orderId, '→', status);
    };

    const acceptOrder = (orderId: string, driverId: string): boolean => {
        const order = orders.find(o => o.id === orderId && o.status === 'pending');
        if (order) {
            updateOrderStatus(orderId, 'accepted', driverId);
            console.log('✅ Order accepted by driver:', driverId);
            return true;
        }
        return false;
    };

    const getOrdersByDriver = (driverId: string): Order[] => {
        return orders.filter(order => order.driverId === driverId);
    };

    const getOrdersByCustomer = (customerId: string): Order[] => {
        return orders.filter(order => order.customerId === customerId);
    };

    const getAvailableOrders = (): Order[] => {
        return orders.filter(order => order.status === 'pending');
    };

    return (
        <OrderContext.Provider value={{
            orders,
            createOrder,
            updateOrderStatus,
            getOrdersByDriver,
            getOrdersByCustomer,
            getAvailableOrders,
            acceptOrder
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
} 