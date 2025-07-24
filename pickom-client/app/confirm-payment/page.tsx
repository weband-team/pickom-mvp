'use client';

import { useState } from 'react';
import Link from 'next/link';
import PhoneWrapper from '../components/PhoneWrapper';

export default function ConfirmPaymentPage() {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        // Redirect to orders page
        window.location.href = '/orders';
    };

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
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 className="title-main">Pickom</h1>
                        <p className="subtitle">People-Powered Delivery</p>

                        {/* Success Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '24px auto',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2 className="title-section">Confirm & Pay</h2>
                    </div>

                    <div className="space-y-6 pb-safe">
                        {/* Route Summary */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
                                Delivery Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        background: '#10b981',
                                        borderRadius: '50%',
                                        flexShrink: 0
                                    }}></div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#999' }}>Pickup</div>
                                        <div style={{ fontSize: '16px', color: '#fff' }}>Warsaw Central Station</div>
                                    </div>
                                </div>
                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    background: '#374151',
                                    marginLeft: '5px'
                                }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        background: '#ef4444',
                                        borderRadius: '50%',
                                        flexShrink: 0
                                    }}></div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#999' }}>Drop-off</div>
                                        <div style={{ fontSize: '16px', color: '#fff' }}>Krakow Main Square</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Traveler Info */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
                                Your Picker
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>
                                    AK
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: '#fff' }}>Anna K.</div>
                                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>★ 4.8 • 127 deliveries</div>
                                    <div style={{ fontSize: '14px', color: '#10b981' }}>En route • Tomorrow 2:00 PM</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', color: '#999' }}>Estimated</div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>45 min</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
                                Payment Method
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { id: 'card', label: 'Credit Card', icon: '💳', details: '**** **** **** 1234' },
                                    { id: 'paypal', label: 'PayPal', icon: '🅿️', details: 'anna@example.com' },
                                    { id: 'apple', label: 'Apple Pay', icon: '🍎', details: 'Touch ID' }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPaymentMethod(method.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px',
                                            background: selectedPaymentMethod === method.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                            border: selectedPaymentMethod === method.id ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{method.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff' }}>{method.label}</div>
                                            <div style={{ fontSize: '14px', color: '#999' }}>{method.details}</div>
                                        </div>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: selectedPaymentMethod === method.id ? '6px solid #6366f1' : '2px solid #374151',
                                            background: selectedPaymentMethod === method.id ? '#fff' : 'transparent'
                                        }}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
                                Payment Summary
                            </h3>
                            <div className="space-y-3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px', color: '#fff' }}>Delivery Fee</span>
                                    <span style={{ fontSize: '16px', color: '#fff' }}>$22.00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#999' }}>Service Fee</span>
                                    <span style={{ color: '#999' }}>$2.00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#999' }}>Pickom Fee (4%)</span>
                                    <span style={{ color: '#999' }}>$1.00</span>
                                </div>
                                <div style={{
                                    height: '1px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    margin: '12px 0'
                                }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Total</span>
                                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>$25.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <div style={{ paddingTop: '8px' }}>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: isProcessing ? '#374151' : 'linear-gradient(135deg, #f97316, #ea580c)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: isProcessing ? 'none' : '0 8px 32px rgba(249, 115, 22, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isProcessing ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid transparent',
                                            borderTop: '2px solid #fff',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        🔒 Pay $25.00
                                    </>
                                )}
                            </button>
                        </div>

                        <div style={{
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '16px'
                        }}>
                            🔒 Your payment is secured with 256-bit SSL encryption
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </PhoneWrapper>
    );
} 