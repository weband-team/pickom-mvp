'use client';

import BottomNavigation from '../components/BottomNavigation';
import PhoneWrapper from '../components/PhoneWrapper';

export default function OrdersPage() {
    const orders = [
        {
            id: 1,
            route: 'Warsaw → Paris',
            price: '€70.00',
            date: 'Apr 16, 2024',
            status: 'Delivered'
        },
        {
            id: 2,
            route: 'Within Kraków',
            price: '€8.00',
            date: 'Apr 4, 2024',
            status: 'Delivered'
        },
        {
            id: 3,
            route: 'Poznań → Berlin',
            price: '€50.00',
            date: 'Mar 22, 2024',
            status: 'Delivered'
        }
    ];

    return (
        <PhoneWrapper>
            <div className="page">
                {/* Status Bar */}
                <div className="status-bar">
                    <span>9:41</span>
                    <div className="status-icons">
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <svg width="17" height="11" viewBox="0 0 17 11" fill="white">
                            <path d="M1 5.5C1 3.5 2.5 2 4.5 2S8 3.5 8 5.5 6.5 9 4.5 9 1 7.5 1 5.5z" />
                            <path d="M9 5.5C9 3.5 10.5 2 12.5 2S16 3.5 16 5.5 14.5 9 12.5 9 9 7.5 9 5.5z" />
                        </svg>
                        <svg width="24" height="11" viewBox="0 0 24 11" fill="white">
                            <rect x="1" y="1" width="22" height="9" rx="2" stroke="white" strokeWidth="1" fill="none" />
                            <rect x="2" y="2" width="18" height="7" fill="white" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="content">
                    <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '32px' }}>Order History</h1>

                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{order.route}</div>
                                        <div style={{ fontSize: '14px', color: '#999' }}>{order.date}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{order.price}</div>
                                        <div style={{ fontSize: '14px', color: '#4ade80' }}>{order.status}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '64px', paddingBottom: '100px' }}>
                        <h2 className="title-main">Pickom</h2>
                    </div>
                </div>

                <BottomNavigation />
            </div>
        </PhoneWrapper>
    );
} 