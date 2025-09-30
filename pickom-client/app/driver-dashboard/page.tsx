'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrders } from '../context/OrderContext';
import PhoneWrapper from '../components/PhoneWrapper';
import NavigationWrapper from '../components/NavigationWrapper';
import { useSession } from '../hooks/use-session';


export default function DriverDashboardPage() {
    const { user, signOut } = useSession();
    const { getAvailableOrders, getOrdersByDriver, acceptOrder, updateOrderStatus } = useOrders();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get tab from URL or default to 'available'
    const tabFromUrl = searchParams.get('tab') as 'available' | 'active' | 'history' | null;
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>(tabFromUrl || 'available');

    const currentDriverId = user?.uid || 'driver_1'; // Mock driver ID

    // Get data from OrderContext
    const availableOrders = getAvailableOrders();
    const driverOrders = getOrdersByDriver(currentDriverId);
    const activeDeliveries = driverOrders.filter(order => order.status !== 'delivered');

    useEffect(() => {
        if (user && user.role !== 'picker') {
            router.push('/auth/login');
        }
    }, [user, router]);

    // Update active tab when URL changes
    useEffect(() => {
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const handleAcceptRequest = (orderId: string) => {
        if (acceptOrder(orderId, currentDriverId)) {
            setActiveTab('active');
            alert('Request accepted! Customer will be notified.');      
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdateDeliveryStatus = (orderId: string, newStatus: any) => {
        updateOrderStatus(orderId, newStatus);

        // If delivered, show completion message
        if (newStatus === 'delivered') {
            setTimeout(() => {
                alert('Delivery completed! Payment will be processed.');
            }, 1000);
        }
    };

    const getStatusInfo = (status: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusMap: Record<string, any> = {
            'accepted': { label: 'Accepted', icon: '✅', color: '#10b981', nextStatus: 'heading_to_pickup' as const },
            'heading_to_pickup': { label: 'Heading to Pickup', icon: '🚗', color: '#f59e0b', nextStatus: 'package_collected' as const },
            'package_collected': { label: 'Package Collected', icon: '📦', color: '#3b82f6', nextStatus: 'in_transit' as const },
            'in_transit': { label: 'In Transit', icon: '🚚', color: '#8b5cf6', nextStatus: 'delivered' as const },
            'delivered': { label: 'Delivered', icon: '🎉', color: '#10b981', nextStatus: null }
        };
        return statusMap[status] || statusMap['accepted'];
    };

    const handleLogout = () => {
        signOut();
        router.push('/auth/login');
    };

    if (user && user.role !== 'picker') {
        return null;
    }

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                Driver Dashboard
                            </h1>
                            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                Welcome, {user?.name}! 🚗
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => router.push('/driver-profile')}
                                style={{
                                    background: 'rgba(249, 115, 22, 0.2)',
                                    border: '1px solid #f97316',
                                    borderRadius: '8px',
                                    color: '#f97316',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                👤 Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ padding: '24px 32px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                350 PLN
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                Today&apos;s Earnings
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                12
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                Completed Today
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 32px 24px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px' }}>
                        {[
                            { key: 'available', label: 'Available', icon: '📋' },
                            { key: 'active', label: 'Active', icon: '🚗' },
                            { key: 'history', label: 'History', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setActiveTab(tab.key as any)}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    background: activeTab === tab.key ? '#f97316' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '0 32px', flex: 1 }}>
                    {activeTab === 'available' && (
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: 'white',
                                marginBottom: '16px'
                            }}>
                                Available Delivery Requests ({availableOrders.length})
                            </h3>

                            <div>
                                {availableOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            marginBottom: '16px',
                                            border: order.urgent ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        {order.urgent && (
                                            <div style={{
                                                background: '#f59e0b',
                                                color: 'white',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                display: 'inline-block',
                                                marginBottom: '12px'
                                            }}>
                                                🚨 URGENT
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: 'white',
                                                marginBottom: '8px'
                                            }}>
                                                {order.customerName} • {order.packageType}
                                            </div>

                                            <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '4px' }}>
                                                📍 From: {order.pickupLocation}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                📍 To: {order.dropoffLocation}
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                    🚗 2.5 km
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                    ⏱️ 15 min
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#10b981'
                                            }}>
                                                {order.price} PLN
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAcceptRequest(order.id)}
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            Accept Request
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: 'white',
                                marginBottom: '16px'
                            }}>
                                Active Deliveries ({activeDeliveries.length})
                            </h3>

                            {activeDeliveries.length === 0 ? (
                                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: 'white',
                                        marginBottom: '8px'
                                    }}>
                                        No Active Deliveries
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                        Accept a request to start delivering!
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {activeDeliveries.map((delivery) => {
                                        const statusInfo = getStatusInfo(delivery.status);
                                        return (
                                            <div
                                                key={delivery.id}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '16px',
                                                    padding: '20px',
                                                    marginBottom: '16px',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                {/* Header with Order ID and Status */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '16px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '16px',
                                                        fontWeight: '700',
                                                        color: 'white'
                                                    }}>
                                                        {delivery.id}
                                                    </div>
                                                    <div style={{
                                                        background: statusInfo.color,
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <span>{statusInfo.icon}</span>
                                                        <span>{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        marginBottom: '4px'
                                                    }}>
                                                        👤 {delivery.customerName}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        📞 {delivery.customerPhone}
                                                    </div>
                                                </div>

                                                {/* Locations */}
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '4px' }}>
                                                        📍 From: {delivery.pickupLocation}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        📍 To: {delivery.dropoffLocation}
                                                    </div>
                                                </div>

                                                {/* Package & Price */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '16px'
                                                }}>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        📦 {delivery.packageType}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '18px',
                                                        fontWeight: '700',
                                                        color: '#10b981'
                                                    }}>
                                                        {delivery.price} PLN
                                                    </div>
                                                </div>

                                                {/* Special Instructions */}
                                                {delivery.specialInstructions && (
                                                    <div style={{
                                                        background: 'rgba(249, 115, 22, 0.1)',
                                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#f97316', marginBottom: '4px' }}>
                                                            ⚠️ Special Instructions:
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: 'white' }}>
                                                            {delivery.specialInstructions}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                {statusInfo.nextStatus && (
                                                    <button
                                                        onClick={() => handleUpdateDeliveryStatus(delivery.id, statusInfo.nextStatus!)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd)`,
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            color: 'white',
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                            e.currentTarget.style.boxShadow = `0 4px 12px ${statusInfo.color}40`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        {statusInfo.nextStatus === 'heading_to_pickup' && '🚗 Start Heading to Pickup'}
                                                        {statusInfo.nextStatus === 'package_collected' && '📦 Mark Package Collected'}
                                                        {statusInfo.nextStatus === 'in_transit' && '🚚 Start Transit'}
                                                        {statusInfo.nextStatus === 'delivered' && '🎉 Mark as Delivered'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '8px'
                            }}>
                                Delivery History
                            </h3>
                            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                Your completed deliveries will appear here
                            </p>
                        </div>
                    )}
                </div>
                <NavigationWrapper />
            </div>
        </PhoneWrapper>
    );
} 