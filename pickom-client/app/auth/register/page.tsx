'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhoneWrapper from '../../components/PhoneWrapper';
import { useAuthLogic } from '../useAuthLogic';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'sender' | 'picker'>('sender');
    const [error, setError] = useState('');
    const { handleSignUp } = useAuthLogic();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            console.log(name);
            await handleSignUp(role, email, password, phone, name);
        } catch (error) {
            setError(error as string);
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
                    <div style={{ marginBottom: '48px' }}>
                        <h1 className="title-main">Pickom</h1>
                        <p className="subtitle">People-Powered Delivery</p>
                        <h2 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '0' }}>Create Account</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                placeholder="Full Name"
                                required
                            />
                        </div>

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

                        <div className="form-group">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                placeholder="Confirm Password"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#9CA3AF',
                                marginBottom: '12px'
                            }}>
                                I want to:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setRole('sender')}
                                    style={{
                                        padding: '16px 20px',
                                        background: role === 'sender' ?
                                            'linear-gradient(135deg, #f97316, #ea580c)' :
                                            'rgba(255, 255, 255, 0.05)',
                                        border: role === 'sender' ?
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
                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Send Packages</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Customer</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('picker')}
                                    style={{
                                        padding: '16px 20px',
                                        background: role === 'picker' ?
                                            'linear-gradient(135deg, #f97316, #ea580c)' :
                                            'rgba(255, 255, 255, 0.05)',
                                        border: role === 'picker' ?
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
                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Deliver Packages</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Driver</div>
                                </button>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="form-group">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="form-input"
                                placeholder="Phone Number (recommended)"
                            />
                        </div>

                        <div style={{ paddingTop: '24px' }}>
                            <button type="submit" className="btn-primary">
                                Sign Up
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                            <Link href="/auth/login" style={{ color: '#999', textDecoration: 'underline' }}>
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </PhoneWrapper>
    );
} 