'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhoneWrapper from '../components/PhoneWrapper';
import { useOrders } from '../context/OrderContext';
import { Order } from '../context/OrderContext';

export default function TrackPackagePage() {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { orders } = useOrders();

    const orderId = searchParams.get('orderId');

    useEffect(() => {
        if (orderId) {
            const foundOrder = orders.find(o => o.id === orderId);
            if (foundOrder) {
                setOrder(foundOrder);
            }
        }
        setIsLoading(false);
    }, [orderId, orders]);

    // Auto-refresh order status every 5 seconds
    useEffect(() => {
        if (!orderId) return;

        const interval = setInterval(() => {
            const updatedOrder = orders.find(o => o.id === orderId);
            if (updatedOrder) {
                setOrder(updatedOrder);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [orderId, orders]);

    const getStatusInfo = () => {
        if (!order) return null;

        switch (order.status) {
            case 'pending':
                return {
                    icon: '⏳',
                    title: 'Order Pending',
                    message: 'Waiting for a driver to accept your order...',
                    color: '#f59e0b',
                    progress: 10
                };
            case 'accepted':
                return {
                    icon: '✅',
                    title: 'Order Accepted',
                    message: 'A driver has accepted your order!',
                    color: '#10b981',
                    progress: 25
                };
            case 'heading_to_pickup':
                return {
                    icon: '🚗',
                    title: 'Driver En Route',
                    message: 'Driver is heading to pickup location',
                    color: '#3b82f6',
                    progress: 50
                };
            case 'package_collected':
                return {
                    icon: '📦',
                    title: 'Package Collected',
                    message: 'Your package has been picked up',
                    color: '#8b5cf6',
                    progress: 75
                };
            case 'in_transit':
                return {
                    icon: '🚚',
                    title: 'In Transit',
                    message: 'Your package is on the way to destination',
                    color: '#f97316',
                    progress: 90
                };
            case 'delivered':
                return {
                    icon: '🎉',
                    title: 'Delivered!',
                    message: 'Your package has been successfully delivered',
                    color: '#10b981',
                    progress: 100
                };
            default:
                return {
                    icon: '❓',
                    title: 'Unknown Status',
                    message: 'Please contact support',
                    color: '#6b7280',
                    progress: 0
                };
        }
    };

    if (isLoading) {
        return (
            <PhoneWrapper>
                <div className="page">
                    <div className="content center-content">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                            Loading...
                        </h2>
                        <p style={{ fontSize: '16px', color: '#9CA3AF' }}>
                            Fetching your order details
                        </p>
                    </div>
                </div>
            </PhoneWrapper>
        );
    }

    if (!order) {
        return (
            <PhoneWrapper>
                <div className="page">
                    <div className="content center-content">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                            Order Not Found
                        </h2>
                        <p style={{ fontSize: '16px', color: '#9CA3AF', marginBottom: '24px' }}>
                            We couldn&apos;t find your order. Please check the order ID.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-primary"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </PhoneWrapper>
        );
    }

    const statusInfo = getStatusInfo();

    return (
        <PhoneWrapper>
            <div className="page">
                {/* Status Bar */}
                <div className="status-bar">
                    <span>9:41</span>
                    <div className="status-icons">
                        <span>📶</span>
                        <span>📶</span>
                        <span>🔋</span>
                    </div>
                </div>

                {/* Header */}
                <div style={{
                    padding: '20px 32px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => router.back()}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#f97316',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back
                        </button>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                            Track Package
                        </h1>
                    </div>
                </div>

                <div className="content" style={{ padding: '32px' }}>
                    {/* Order Info */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '16px'
                        }}>
                            Order #{order.id.substring(0, 8).toUpperCase()}
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '4px' }}>
                                📍 From: {order.pickupLocation}
                            </div>
                            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                📍 To: {order.dropoffLocation}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                📦 {order.packageType}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                                {order.price} PLN
                            </div>
                        </div>
                    </div>

                    {/* Status Section */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '32px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }}>
                        {/* Status Icon */}
                        <div style={{
                            fontSize: '72px',
                            marginBottom: '16px',
                            animation: 'bounce 2s infinite'
                        }}>
                            {statusInfo?.icon}
                        </div>

                        {/* Status Title */}
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            {statusInfo?.title}
                        </h2>

                        {/* Status Message */}
                        <p style={{
                            fontSize: '16px',
                            color: '#9CA3AF',
                            marginBottom: '24px'
                        }}>
                            {statusInfo?.message}
                        </p>

                        {/* Progress Bar */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            height: '8px',
                            overflow: 'hidden',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                background: `linear-gradient(90deg, ${statusInfo?.color}, ${statusInfo?.color}dd)`,
                                height: '100%',
                                width: `${statusInfo?.progress}%`,
                                transition: 'width 1s ease',
                                borderRadius: '12px'
                            }} />
                        </div>

                        <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                            {statusInfo?.progress}% Complete
                        </div>
                    </div>

                    {/* Driver Info */}
                    {order.driverId && order.status !== 'pending' && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '12px'
                            }}>
                                Your Driver
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    color: 'white'
                                }}>
                                    👤
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                        Driver #{order.driverId.substring(0, 6)}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                        ⭐ 4.8 • Professional Driver
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                        <div style={{
                            background: 'rgba(249, 115, 22, 0.1)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f97316', marginBottom: '8px' }}>
                                ⚠️ Special Instructions:
                            </div>
                            <div style={{ fontSize: '14px', color: 'white' }}>
                                {order.specialInstructions}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: '32px' }}>
                        {order.status === 'delivered' ? (
                            <button
                                onClick={() => router.push('/rate-experience')}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginBottom: '12px'
                                }}
                            >
                                🌟 Rate Your Experience
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginBottom: '12px'
                                }}
                            >
                                🔄 Refresh Status
                            </button>
                        )}

                        <button
                            onClick={() => router.push('/')}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            🏠 Go Home
                        </button>
                    </div>
                </div>

                {/* Animations */}
                <style jsx>{`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }
                `}</style>
            </div>
        </PhoneWrapper>
    );
} 