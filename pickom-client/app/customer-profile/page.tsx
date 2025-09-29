'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '../context/OrderContext';
import PhoneWrapper from '../components/PhoneWrapper';
import { useSession } from '../hooks/use-session';
import { deleteUser, updateUser } from '../api/user';

export default function CustomerProfilePage() {
    const { user, status, signOut } = useSession();
    const { getOrdersByCustomer } = useOrders();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
    const [profilePhoto, setProfilePhoto] = useState('/placeholder-avatar.jpg');
    const [isLoading, setIsLoading] = useState(false);
    console.log('user', user);

    // Profile data
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dateOfBirth: '',
        emergencyContact: '',
        bio: '',
        memberSince: '2024-01-01'
    });

    // Get customer orders
    const currentCustomerId = user?.uid || 'customer_1';
    const customerOrders = getOrdersByCustomer(currentCustomerId);

    useEffect(() => {
        if (status !== 'loading' && user && user?.role !== 'sender') {
            console.log('user profile');
            router.push('/auth/login');
        }
    }, [user, router, status]);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePhoto(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getOrderStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string, icon: string, color: string }> = {
            'pending': { label: 'Pending', icon: '⏳', color: '#f59e0b' },
            'accepted': { label: 'Accepted', icon: '✅', color: '#10b981' },
            'heading_to_pickup': { label: 'Driver En Route', icon: '🚗', color: '#3b82f6' },
            'package_collected': { label: 'Collected', icon: '📦', color: '#8b5cf6' },
            'in_transit': { label: 'In Transit', icon: '🚚', color: '#f97316' },
            'delivered': { label: 'Delivered', icon: '🎉', color: '#10b981' }
        };
        return statusMap[status] || statusMap['pending'];
    };

    const handleSaveProfile = async () => {
        if (!user?.uid) {
            alert('User not found');
            return;
        }

        setIsLoading(true);
        try {
            await updateUser(user.uid, {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!user?.uid) {
            alert('User not found');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmDelete) {
            return;
        }

        setIsLoading(true);
        try {
            await deleteUser(user.uid);
            alert('User deleted successfully!');
            router.push('/auth/login');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again');
        } finally {
            setIsLoading(false);
        }
    } 

    const handleLogout = () => {
        signOut();
        router.push('/auth/login');
    };

    if (user && user.role !== 'sender') {
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

                {/* Header */}
                <div style={{
                    padding: '20px 32px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => router.back()}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#f97316',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back
                        </button>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                            My Profile
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px' }}>
                        {[
                            { key: 'profile', label: 'Profile', icon: '👤' },
                            { key: 'orders', label: 'Orders', icon: '📦' },
                            { key: 'settings', label: 'Settings', icon: '⚙️' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as 'profile' | 'orders' | 'settings')}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    background: activeTab === tab.key ? '#f97316' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '0 32px 32px', flex: 1 }}>
                    {activeTab === 'profile' && (
                        <div>
                            {/* Profile Photo */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        background: profilePhoto.includes('placeholder') ?
                                            'linear-gradient(135deg, #f97316, #ea580c)' :
                                            `url(${profilePhoto})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '48px',
                                        color: 'white',
                                        marginBottom: '16px',
                                        border: '4px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        {profilePhoto.includes('placeholder') && '👤'}
                                    </div>

                                    <label style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '8px',
                                        width: '36px',
                                        height: '36px',
                                        background: '#f97316',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: 'white',
                                        border: '2px solid #000'
                                    }}>
                                        📷
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                    {profileData.name}
                                </div>
                                <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '16px' }}>
                                    📦 Customer • Member since {new Date(profileData.memberSince).getFullYear()}
                                </div>
                            </div>

                            {/* Profile Form */}
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={profileData.dateOfBirth}
                                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Emergency Contact
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.emergencyContact}
                                        onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                                        className="form-input"
                                        placeholder="+48 123 456 789"
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        About Me
                                    </label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="form-input h-24"
                                        placeholder="Tell us about yourself..."
                                        maxLength={150}
                                    />
                                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                                        {profileData.bio.length}/150
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleSaveProfile}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
                                Order History ({customerOrders.length})
                            </h3>

                            {customerOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: 'white',
                                        marginBottom: '8px'
                                    }}>
                                        No Orders Yet
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                        Start your first delivery!
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {customerOrders.map((order) => {
                                        const statusInfo = getOrderStatusInfo(order.status);
                                        return (
                                            <div
                                                key={order.id}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '16px',
                                                    padding: '20px',
                                                    marginBottom: '16px',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
                                                        Order #{order.id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                    <div style={{
                                                        background: statusInfo.color,
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <span>{statusInfo.icon}</span>
                                                        <span>{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '4px' }}>
                                                        📍 From: {order.pickupLocation}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        📍 To: {order.dropoffLocation}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        📦 {order.packageType}
                                                    </div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                                        {order.price} PLN
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                                    📅 {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>

                                                {order.status !== 'delivered' && (
                                                    <button
                                                        onClick={() => router.push(`/track-package?orderId=${order.id}`)}
                                                        style={{
                                                            width: '100%',
                                                            marginTop: '12px',
                                                            padding: '8px',
                                                            background: 'rgba(249, 115, 22, 0.2)',
                                                            border: '1px solid #f97316',
                                                            borderRadius: '6px',
                                                            color: '#f97316',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Track Order
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
                                Settings
                            </h3>

                            <div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '16px'
                                }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                                        Notifications
                                    </h4>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                                            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                                            <span style={{ color: 'white', fontSize: '14px' }}>Order status updates</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                                            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                                            <span style={{ color: 'white', fontSize: '14px' }}>Driver messages</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                                            <span style={{ color: 'white', fontSize: '14px' }}>Promotions and offers</span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '16px'
                                }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                                        Preferences
                                    </h4>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                                        <span style={{ color: 'white', fontSize: '14px' }}>Save order history</span>
                                    </label>
                                </div>

                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '12px',
                                    padding: '16px'
                                }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>
                                        Account Management
                                    </h4>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
                                        Manage your account settings and data.
                                    </p>
                                    <div style={{ marginBottom: '16px' }}>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                padding: '12px 24px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                width: '100%',
                                                marginBottom: '12px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                    <button style={{
                                        background: 'none',
                                        border: '1px solid #ef4444',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        marginRight: '8px'
                                    }}>
                                        Export Data
                                    </button>
                                    <button style={{
                                        background: 'none',
                                        border: '1px solid #ef4444',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }} onClick={handleDeleteUser}>
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PhoneWrapper>
    );
} 