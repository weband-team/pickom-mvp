'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneWrapper from '../components/PhoneWrapper';
import { useAuthLogic } from '../auth/useAuthLogic';
import { useSession } from '../hooks/use-session';

interface ScheduleEntry {
    id: string;
    date: string;
    cities: string[];
    timeSlots: string[];
    maxPackages: number;
    isActive: boolean;
}

export default function DriverProfilePage() {
    const { user, signOut, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'settings'>('profile');
    const [profilePhoto, setProfilePhoto] = useState('/placeholder-avatar.jpg');

    // Profile data
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        vehicleType: 'car',
        vehiclePlate: '',
        bio: '',
        experience: '1',
        rating: 4.8,
        completedDeliveries: 234
    });

    // Schedule data
    const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([
        {
            id: '1',
            date: '2024-01-15',
            cities: ['Warsaw', 'Kraków'],
            timeSlots: ['09:00-12:00', '14:00-18:00'],
            maxPackages: 5,
            isActive: true
        },
        {
            id: '2',
            date: '2024-01-16',
            cities: ['Gdańsk'],
            timeSlots: ['10:00-16:00'],
            maxPackages: 3,
            isActive: true
        }
    ]);

    const [newSchedule, setNewSchedule] = useState({
        date: '',
        cities: [] as string[],
        timeSlots: [''] as string[],
        maxPackages: 3
    });

    const [showAddSchedule, setShowAddSchedule] = useState(false);

    const polishCities = [
        'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk',
        'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok', 'Katowice'
    ];

    useEffect(() => {
        if (status !== 'loading' && user && user?.role !== 'picker') {
            router.push('/auth/login');
        }
    }, [user, router]);

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

    const handleAddSchedule = () => {
        if (newSchedule.date && newSchedule.cities.length > 0) {
            const entry: ScheduleEntry = {
                id: Date.now().toString(),
                date: newSchedule.date,
                cities: newSchedule.cities,
                timeSlots: newSchedule.timeSlots.filter(slot => slot.trim() !== ''),
                maxPackages: newSchedule.maxPackages,
                isActive: true
            };
            setScheduleEntries([...scheduleEntries, entry]);
            setNewSchedule({
                date: '',
                cities: [],
                timeSlots: [''],
                maxPackages: 3
            });
            setShowAddSchedule(false);
        }
    };

    const toggleScheduleEntry = (id: string) => {
        setScheduleEntries(entries =>
            entries.map(entry =>
                entry.id === id ? { ...entry, isActive: !entry.isActive } : entry
            )
        );
    };

    const removeScheduleEntry = (id: string) => {
        setScheduleEntries(entries => entries.filter(entry => entry.id !== id));
    };

    const addTimeSlot = () => {
        setNewSchedule({
            ...newSchedule,
            timeSlots: [...newSchedule.timeSlots, '']
        });
    };

    const updateTimeSlot = (index: number, value: string) => {
        const updatedSlots = [...newSchedule.timeSlots];
        updatedSlots[index] = value;
        setNewSchedule({
            ...newSchedule,
            timeSlots: updatedSlots
        });
    };

    const removeTimeSlot = (index: number) => {
        setNewSchedule({
            ...newSchedule,
            timeSlots: newSchedule.timeSlots.filter((_, i) => i !== index)
        });
    };

    const toggleCity = (city: string) => {
        const updatedCities = newSchedule.cities.includes(city)
            ? newSchedule.cities.filter(c => c !== city)
            : [...newSchedule.cities, city];

        setNewSchedule({
            ...newSchedule,
            cities: updatedCities
        });
    };

    const handleLogout = () => {
        signOut();
        router.push('/auth/login');
    };

    if (user && user.role !== 'picker') {
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
                            Driver Profile
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px' }}>
                        {[
                            { key: 'profile', label: 'Profile', icon: '👤' },
                            { key: 'schedule', label: 'Schedule', icon: '📅' },
                            { key: 'settings', label: 'Settings', icon: '⚙️' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
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
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
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
                                    ⭐ {profileData.rating} • {profileData.completedDeliveries} deliveries
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
                                        Vehicle Type
                                    </label>
                                    <select
                                        value={profileData.vehicleType}
                                        onChange={(e) => setProfileData({ ...profileData, vehicleType: e.target.value })}
                                        className="form-input"
                                    >
                                        <option value="car">🚗 Car</option>
                                        <option value="van">🚐 Van</option>
                                        <option value="truck">🚚 Truck</option>
                                        <option value="bike">🏍️ Motorcycle</option>
                                        <option value="bicycle">🚲 Bicycle</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Vehicle Plate Number
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.vehiclePlate}
                                        onChange={(e) => setProfileData({ ...profileData, vehiclePlate: e.target.value })}
                                        className="form-input"
                                        placeholder="e.g. WA 12345"
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Experience (years)
                                    </label>
                                    <select
                                        value={profileData.experience}
                                        onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                        className="form-input"
                                    >
                                        <option value="1">Less than 1 year</option>
                                        <option value="2">1-2 years</option>
                                        <option value="3">2-5 years</option>
                                        <option value="5">5+ years</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                        Bio
                                    </label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="form-input h-24"
                                        placeholder="Tell customers about yourself..."
                                        maxLength={200}
                                    />
                                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                                        {profileData.bio.length}/200
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => alert('Profile updated!')}
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>
                                    My Schedule ({scheduleEntries.length})
                                </h3>
                                <button
                                    onClick={() => setShowAddSchedule(true)}
                                    style={{
                                        background: '#f97316',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Add
                                </button>
                            </div>

                            {/* Schedule Entries */}
                            <div style={{ marginBottom: '24px' }}>
                                {scheduleEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        style={{
                                            background: entry.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            border: entry.isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                                                    📅 {new Date(entry.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                    🏙️ {entry.cities.join(' → ')}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => toggleScheduleEntry(entry.id)}
                                                    style={{
                                                        background: entry.isActive ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {entry.isActive ? '✓' : '❌'}
                                                </button>
                                                <button
                                                    onClick={() => removeScheduleEntry(entry.id)}
                                                    style={{
                                                        background: '#ef4444',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', color: '#9CA3AF' }}>
                                            <div>
                                                ⏰ {entry.timeSlots.join(', ')}
                                            </div>
                                            <div>
                                                📦 Max {entry.maxPackages} packages
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Schedule Modal */}
                            {showAddSchedule && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0, 0, 0, 0.8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1000,
                                    padding: '20px'
                                }}>
                                    <div style={{
                                        background: '#1f2937',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        maxWidth: '320px',
                                        width: '100%',
                                        maxHeight: '80vh',
                                        overflowY: 'auto'
                                    }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>
                                            Add Schedule
                                        </h3>

                                        {/* Date */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newSchedule.date}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                                className="form-input"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        {/* Cities */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                                Cities
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                                                {polishCities.map((city) => (
                                                    <button
                                                        key={city}
                                                        type="button"
                                                        onClick={() => toggleCity(city)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            background: newSchedule.cities.includes(city) ? '#f97316' : 'rgba(255, 255, 255, 0.1)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Time Slots */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                                Time Slots
                                            </label>
                                            {newSchedule.timeSlots.map((slot, index) => (
                                                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={slot}
                                                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                                                        placeholder="e.g. 09:00-12:00"
                                                        className="form-input"
                                                        style={{ fontSize: '14px' }}
                                                    />
                                                    {newSchedule.timeSlots.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTimeSlot(index)}
                                                            style={{
                                                                background: '#ef4444',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                color: 'white',
                                                                padding: '8px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ❌
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addTimeSlot}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + Add Time Slot
                                            </button>
                                        </div>

                                        {/* Max Packages */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
                                                Max Packages
                                            </label>
                                            <input
                                                type="number"
                                                value={newSchedule.maxPackages}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, maxPackages: parseInt(e.target.value) || 1 })}
                                                className="form-input"
                                                min="1"
                                                max="20"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => setShowAddSchedule(false)}
                                                style={{
                                                    flex: 1,
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    padding: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddSchedule}
                                                style={{
                                                    flex: 1,
                                                    background: '#f97316',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    padding: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Add Schedule
                                            </button>
                                        </div>
                                    </div>
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
                                            <span style={{ color: 'white', fontSize: '14px' }}>New delivery requests</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                                            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                                            <span style={{ color: 'white', fontSize: '14px' }}>Customer messages</span>
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
                                        Availability
                                    </h4>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                                        <span style={{ color: 'white', fontSize: '14px' }}>Available for new requests</span>
                                    </label>
                                </div>

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

                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '12px',
                                    padding: '16px'
                                }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>
                                        Danger Zone
                                    </h4>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
                                        Once you delete your account, there is no going back.
                                    </p>
                                    <button style={{
                                        background: 'none',
                                        border: '1px solid #ef4444',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}>
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