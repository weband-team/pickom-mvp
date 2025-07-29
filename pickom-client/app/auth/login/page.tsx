'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import PhoneWrapper from '../../components/PhoneWrapper';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'customer' | 'driver'>('customer');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(email, password, role)) {
            // Redirect based on role
            if (role === 'driver') {
                router.push('/driver-dashboard');
            } else {
                router.push('/');
            }
        } else {
            setError('Please enter both email and password');
        }
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
                <div className="content center-content">
                    <div style={{ marginBottom: '64px' }}>
                        <h1 className="title-main">Pickom</h1>
                        <p className="subtitle">People-Powered Delivery</p>
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#9CA3AF',
                            marginBottom: '12px',
                            textAlign: 'center'
                        }}>
                            Login as:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setRole('customer')}
                                style={{
                                    padding: '16px 20px',
                                    background: role === 'customer' ?
                                        'linear-gradient(135deg, #f97316, #ea580c)' :
                                        'rgba(255, 255, 255, 0.05)',
                                    border: role === 'customer' ?
                                        '2px solid #f97316' :
                                        '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>Customer</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('driver')}
                                style={{
                                    padding: '16px 20px',
                                    background: role === 'driver' ?
                                        'linear-gradient(135deg, #f97316, #ea580c)' :
                                        'rgba(255, 255, 255, 0.05)',
                                    border: role === 'driver' ?
                                        '2px solid #f97316' :
                                        '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚗</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>Driver</div>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div style={{ paddingTop: '24px' }}>
                            <button type="submit" className="btn-primary">
                                Sign In
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                            <Link href="/auth/register" style={{ color: '#999', textDecoration: 'underline' }}>
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </PhoneWrapper>
    );
} 