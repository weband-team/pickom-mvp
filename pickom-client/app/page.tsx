'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { useLoading } from './context/LoadingContext';
import PhoneWrapper from './components/PhoneWrapper';
import NavigationWrapper from './components/NavigationWrapper';

export default function HomePage() {
    const [selectedType, setSelectedType] = useState('Intra-City');
    const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>('now');
    const { isAuthenticated, isDriver, user } = useAuth();
    const { showLoading, hideLoading } = useLoading();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (isDriver) {
            // Redirect drivers to their dashboard
            router.push('/driver-dashboard');
        }
    }, [isAuthenticated, isDriver, router]);

    const handleContinue = async () => {
        showLoading("Preparing your delivery request...");

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        hideLoading();
        router.push(`/send-package?type=${encodeURIComponent(selectedType)}`);
    };

    const handleScheduleDelivery = async () => {
        showLoading("Opening delivery scheduler...");

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));

        hideLoading();
        router.push(`/schedule-delivery?type=${encodeURIComponent(selectedType)}`);
    };

    if (!isAuthenticated || isDriver) {
        return null;
    }

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
                <div className="content center-content">
                    <div className="mb-32">
                        {/* Header with Profile Button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px'
                        }}>
                            <div>
                                <h1 className="title-main">Pickom</h1>
                                <p className="subtitle">People-Powered Delivery</p>
                            </div>
                            <button
                                onClick={() => router.push('/customer-profile')}
                                style={{
                                    background: 'rgba(249, 115, 22, 0.2)',
                                    border: '1px solid #f97316',
                                    borderRadius: '50%',
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#f97316',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(249, 115, 22, 0.3)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                👤
                            </button>
                        </div>

                        <h2 className="title-section">Send a Package</h2>

                        <div className="btn-group">
                            {['Intra-City', 'Inter-City'].map((type) => (
                                <button
                                    key={type}
                                    className={`btn-tab ${selectedType === type ? 'active' : ''}`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Delivery Mode Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: 'white',
                                textAlign: 'center',
                                marginBottom: '16px'
                            }}>
                                When would you like to send?
                            </h3>

                            <div className="btn-group">
                                <button
                                    className={`btn-tab ${deliveryMode === 'now' ? 'active' : ''}`}
                                    onClick={() => setDeliveryMode('now')}
                                >
                                    🚀 Send Now
                                </button>
                                <button
                                    className={`btn-tab ${deliveryMode === 'scheduled' ? 'active' : ''}`}
                                    onClick={() => setDeliveryMode('scheduled')}
                                >
                                    📅 Schedule
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {deliveryMode === 'now' ? (
                            <button onClick={handleContinue} className="btn-primary">
                                Continue with Immediate Delivery
                            </button>
                        ) : (
                            <button onClick={handleScheduleDelivery} className="btn-primary">
                                Schedule Delivery
                            </button>
                        )}
                    </div>
                </div>

                <NavigationWrapper />
            </div>
        </PhoneWrapper>
    );
} 