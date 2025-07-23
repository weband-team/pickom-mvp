'use client';

import Link from 'next/link';
import PhoneWrapper from '../components/PhoneWrapper';

export default function SelectTravelerPage() {
    const travelers = [
        {
            id: 1,
            name: 'Michael K.',
            time: '50 min',
            price: '30 zł',
            trust: '96%',
        },
        {
            id: 2,
            name: 'Ewa S.',
            time: '55 min',
            price: '35 zł',
            trust: '92%',
        },
        {
            id: 3,
            name: 'John A.',
            time: '1 hr 5 min',
            price: '28 zł',
            trust: '88%',
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
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h1 className="title-main">Pickom</h1>
                        <p className="subtitle">People-Powered Delivery</p>
                        <h2 className="title-section">Select a Picker</h2>
                    </div>

                    <div style={{ marginBottom: '16px', paddingLeft: '0' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Best Match</h3>
                    </div>

                    <div className="space-y-4 pb-safe">
                        {travelers.map((traveler, index) => (
                            <div key={traveler.id} className="picker-item">
                                <div className="picker-avatar">
                                    {traveler.name.charAt(0)}
                                </div>

                                <div className="picker-info">
                                    <div className="picker-name">{traveler.name}</div>
                                    <div className="picker-route">Pickup to Drop-off</div>
                                    <div className="picker-trust">
                                        <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                                        Trust: {traveler.trust}
                                        <button style={{ color: '#60a5fa', textDecoration: 'underline', background: 'none', border: 'none', fontSize: '12px', marginLeft: '8px' }}>
                                            Chat
                                        </button>
                                    </div>
                                </div>

                                <div className="picker-details">
                                    <div className="picker-time">{traveler.time}</div>
                                    <div className="picker-price">{traveler.price}</div>
                                    <Link href="/confirm-payment">
                                        <button className="btn-select">Select Picker</button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PhoneWrapper>
    );
} 