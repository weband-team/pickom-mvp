'use client';

import { useRouter } from 'next/navigation';
import BottomNavigation from '../components/BottomNavigation';
import PhoneWrapper from '../components/PhoneWrapper';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    if (!isAuthenticated) {
        router.push('/auth/login');
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
                <div className="content">
                    <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '32px' }}>Profile</h1>

                    {/* User Info */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            width: '96px',
                            height: '96px',
                            background: '#333',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '32px',
                            fontWeight: '600'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{user?.name || 'User'}</h2>
                        <p style={{ fontSize: '16px', color: '#999', marginBottom: '8px' }}>{user?.email}</p>
                        <button style={{ color: '#999', textDecoration: 'underline', background: 'none', border: 'none', fontSize: '16px' }}>
                            Edit Profile
                        </button>
                    </div>

                    {/* ID Photo */}
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ marginRight: '12px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#999">
                                    <rect x="3" y="4" width="18" height="12" rx="2" stroke="#999" strokeWidth="1" fill="none" />
                                    <path d="M7 8h10M7 12h4" stroke="#999" strokeWidth="1" />
                                </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>ID Photo</div>
                                <div style={{ fontSize: '14px', color: '#999' }}>Add an ID for verification</div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="#999">
                                <path d="M10 4v12M4 10h12" stroke="#999" strokeWidth="1.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Pickom</div>
                                <div style={{ fontSize: '14px', color: '#999' }}>People-Powered Delivery</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} width="16" height="16" viewBox="0 0 16 16" fill={star <= 4 ? '#fbbf24' : '#666'}>
                                            <path d="M8 1l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z" />
                                        </svg>
                                    ))}
                                </div>
                                <div style={{ fontSize: '14px', color: '#999' }}>4.8 Trust Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div style={{ paddingTop: '24px', paddingBottom: '100px' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '24px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                <BottomNavigation />
            </div>
        </PhoneWrapper>
    );
} 