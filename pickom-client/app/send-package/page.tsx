'use client';

import { useState } from 'react';
import Link from 'next/link';
import PhoneWrapper from '../components/PhoneWrapper';
import BottomNavigation from '../components/BottomNavigation';

export default function SendPackagePage() {
    const [selectedType, setSelectedType] = useState('Within City');

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
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 className="title-main">Pickom</h1>
                        <p className="subtitle">People-Powered Delivery</p>
                        <h2 className="title-section">Send a Package</h2>

                        <div className="btn-group">
                            {['Within City', 'Inter-City'].map((type) => (
                                <button
                                    key={type}
                                    className={`btn-tab ${selectedType === type ? 'active' : ''}`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 pb-safe">
                        <div className="form-group">
                            <label className="form-label">Pickup Location</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder=""
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Drop-off Location</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder=""
                            />
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <Link href="/select-traveler" className="btn-primary">
                                Continue
                            </Link>
                        </div>
                    </div>
                </div>

                <BottomNavigation />
            </div>
        </PhoneWrapper>
    );
} 