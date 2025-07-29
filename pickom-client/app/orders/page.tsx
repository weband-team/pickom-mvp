'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationWrapper from '../components/NavigationWrapper';
import PhoneWrapper from '../components/PhoneWrapper';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export default function OrdersPage() {
    const { user, isAuthenticated, isCustomer } = useAuth();
    const { getOrdersByCustomer } = useOrders();
    const router = useRouter();

    const currentCustomerId = user?.id || 'customer_1';
    const customerOrders = getOrdersByCustomer(currentCustomerId);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (!isCustomer) {
            // If not a customer, redirect to dashboard
            router.push('/driver-dashboard');
        }
    }, [isAuthenticated, isCustomer, router]);

    const getOrderStatusInfo = (status: string) => {
        const statusMap: Record<string, any> = {
            'pending': { label: 'Pending', icon: '⏳', color: '#f59e0b' },
            'accepted': { label: 'Accepted', icon: '✅', color: '#10b981' },
            'heading_to_pickup': { label: 'Driver En Route', icon: '🚗', color: '#3b82f6' },
            'package_collected': { label: 'Collected', icon: '📦', color: '#8b5cf6' },
            'in_transit': { label: 'In Transit', icon: '🚚', color: '#f97316' },
            'delivered': { label: 'Delivered', icon: '🎉', color: '#10b981' }
        };
        return statusMap[status] || statusMap['pending'];
    };

    if (!isAuthenticated || !isCustomer) {
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

                {/* Content */}
                <div className="content">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        padding: '0 8px'
                    }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                            My Orders
                        </h1>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#f97316',
                            background: 'rgba(249, 115, 22, 0.1)',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            border: '1px solid rgba(249, 115, 22, 0.3)'
                        }}>
                            {customerOrders.length} {customerOrders.length === 1 ? 'Order' : 'Orders'}
                        </div>
                    </div>

                    {customerOrders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            paddingTop: '80px',
                            paddingBottom: '120px'
                        }}>
                            <div style={{ fontSize: '72px', marginBottom: '24px' }}>📦</div>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: 'white',
                                marginBottom: '12px'
                            }}>
                                No Orders Yet
                            </h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#9CA3AF',
                                marginBottom: '32px',
                                lineHeight: '1.5'
                            }}>
                                Start your first delivery<br />with Pickom today!
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                style={{
                                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    padding: '16px 32px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                📦 Send Your First Package
                            </button>
                        </div>
                    ) : (
                        <div style={{ paddingBottom: '120px' }}>
                            {customerOrders
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((order) => {
                                    const statusInfo = getOrderStatusInfo(order.status);
                                    const isActive = order.status !== 'delivered';

                                    return (
                                        <div
                                            key={order.id}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '20px',
                                                padding: '24px',
                                                marginBottom: '16px',
                                                border: isActive ? '2px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                if (isActive) {
                                                    router.push(`/track-package?orderId=${order.id}`);
                                                }
                                            }}
                                            onMouseEnter={(e) => {
                                                if (isActive) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Header */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '16px'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: '18px',
                                                        fontWeight: '700',
                                                        color: 'white',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Order #{order.id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    background: statusInfo.color,
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <span>{statusInfo.icon}</span>
                                                    <span>{statusInfo.label}</span>
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '8px'
                                                }}>
                                                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                                        📍 Route
                                                    </div>
                                                    {isActive && (
                                                        <div style={{
                                                            background: 'rgba(249, 115, 22, 0.2)',
                                                            color: '#f97316',
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            border: '1px solid rgba(249, 115, 22, 0.3)'
                                                        }}>
                                                            ACTIVE
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.4' }}>
                                                    <div>From: {order.pickupLocation}</div>
                                                    <div>To: {order.dropoffLocation}</div>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '16px',
                                                marginBottom: isActive ? '20px' : '0'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                                                        Package Type
                                                    </div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                                                        📦 {order.packageType}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                                                        Total Cost
                                                    </div>
                                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                                                        {order.price} PLN
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Track Button */}
                                            {isActive && (
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer'
                                                }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        📱 Track Package
                                                        <span style={{ fontSize: '12px', opacity: 0.8 }}>→</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
                <NavigationWrapper />
            </div>
        </PhoneWrapper>
    );
} 