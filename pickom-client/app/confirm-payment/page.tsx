'use client';

import Link from 'next/link';
import PhoneWrapper from '../components/PhoneWrapper';

export default function ConfirmPaymentPage() {
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

                        {/* Icon */}
                        <div style={{ width: '64px', height: '64px', margin: '32px auto 24px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#ff8c00', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <circle cx="12" cy="12" r="9" fill="white" />
                                    <circle cx="9" cy="9" r="1" fill="#ff8c00" />
                                    <circle cx="15" cy="9" r="1" fill="#ff8c00" />
                                    <path d="M8 14 Q12 17 16 14" stroke="#ff8c00" strokeWidth="1" fill="none" />
                                </svg>
                            </div>
                            <div style={{ width: '32px', height: '32px', background: '#333', borderRadius: '8px', margin: '0 auto' }}></div>
                        </div>

                        <h2 className="title-section">Confirm & Pay</h2>
                    </div>

                    <div className="space-y-6 pb-safe">
                        {/* Traveler Info */}
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px', color: '#999' }}>Traveler</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }}>
                                    AK
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Anna K.</div>
                                    <div style={{ fontSize: '14px', color: '#999' }}>En route, Tomorrow</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div className="space-y-4">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px' }}>Total Price</span>
                                <span style={{ fontSize: '18px', fontWeight: '600' }}>$25</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#999' }}>Pickom Commission (10%)</span>
                                <span style={{ color: '#999' }}>$3</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', paddingTop: '16px' }}>
                                <span style={{ fontSize: '18px' }}>To Traveler</span>
                                <span style={{ fontSize: '18px', fontWeight: '600' }}>$22</span>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <div style={{ paddingTop: '24px' }}>
                            <Link href="/orders" className="btn-orange">
                                Pay $25
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PhoneWrapper>
    );
} 