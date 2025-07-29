'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhoneWrapper from '../components/PhoneWrapper';
import NavigationWrapper from '../components/NavigationWrapper';
import CityLocationInput from '../components/CityLocationInput';
import Toast from '../components/Toast';
import { useLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';

interface FormData {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    packageType: 'small' | 'medium' | 'large' | 'document';
    specialInstructions: string;
}

interface FormErrors {
    pickupLocation?: string;
    dropoffLocation?: string;
    pickupDate?: string;
    pickupTime?: string;
}

export default function ScheduleDeliveryPage() {
    const [deliveryType, setDeliveryType] = useState<'Intra-City' | 'Inter-City'>('Intra-City');
    const [formData, setFormData] = useState<FormData>({
        pickupLocation: '',
        dropoffLocation: '',
        pickupDate: '',
        pickupTime: '',
        packageType: 'small',
        specialInstructions: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [buttonLoading, setButtonLoading] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read delivery type from URL parameters
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam) {
            setDeliveryType(typeParam as 'Intra-City' | 'Inter-City');
        }
    }, [searchParams]);

    const packageTypes = [
        { id: 'small', label: 'Small Package', icon: '📦', description: 'Up to 2kg' },
        { id: 'medium', label: 'Medium Package', icon: '📋', description: 'Up to 10kg' },
        { id: 'large', label: 'Large Package', icon: '📚', description: 'Up to 25kg' },
        { id: 'document', label: 'Document', icon: '📄', description: 'Papers only' }
    ];

    // Generate time slots (8 AM to 8 PM, every 30 minutes)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
                slots.push({ value: timeString, label: displayTime });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.pickupLocation.trim()) {
            newErrors.pickupLocation = 'Pickup location is required';
        }
        if (!formData.dropoffLocation.trim()) {
            newErrors.dropoffLocation = 'Drop-off location is required';
        }
        if (!formData.pickupDate) {
            newErrors.pickupDate = 'Pickup date is required';
        }
        if (!formData.pickupTime) {
            newErrors.pickupTime = 'Pickup time is required';
        }

        // Check if date is not in the past
        if (formData.pickupDate) {
            const selectedDate = new Date(formData.pickupDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.pickupDate = 'Cannot schedule delivery for past dates';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSchedule = async () => {
        if (!validateForm()) {
            return;
        }

        setButtonLoading(true);
        showLoading("Scheduling your delivery...");

        await new Promise(resolve => setTimeout(resolve, 2000));

        setButtonLoading(false);
        hideLoading();
        toast.success('Delivery scheduled successfully!');

        setTimeout(() => {
            router.push('/select-traveler');
        }, 300);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30); // Allow scheduling up to 30 days ahead
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <PhoneWrapper>
            <div className="page">
                <Toast />

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
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#f97316',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ← Back
                    </button>
                </div>

                {/* Content */}
                <div className="content" style={{ padding: '24px 32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 className="title-main">Schedule Delivery</h1>
                        <p className="subtitle">Plan your package delivery</p>

                        {/* Display selected delivery type */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'rgba(249, 115, 22, 0.1)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            borderRadius: '25px',
                            color: '#f97316',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginTop: '16px'
                        }}>
                            {deliveryType === 'Intra-City' ? '🏠' : '🌍'} {deliveryType} Delivery
                        </div>
                    </div>

                    {/* Location Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            📍 Delivery Locations
                        </h3>

                        <div style={{ marginBottom: '20px' }}>
                            <CityLocationInput
                                label="Pickup Location"
                                placeholder="Enter pickup address..."
                                value={formData.pickupLocation}
                                onChange={(value: string) => setFormData(prev => ({ ...prev, pickupLocation: value }))}
                                deliveryType={deliveryType}
                            />
                            {errors.pickupLocation && (
                                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                                    {errors.pickupLocation}
                                </p>
                            )}
                        </div>

                        <div>
                            <CityLocationInput
                                label="Drop-off Location"
                                placeholder="Enter delivery address..."
                                value={formData.dropoffLocation}
                                onChange={(value: string) => setFormData(prev => ({ ...prev, dropoffLocation: value }))}
                                deliveryType={deliveryType}
                            />
                            {errors.dropoffLocation && (
                                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                                    {errors.dropoffLocation}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Date & Time Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            🕐 Pickup Schedule
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#9CA3AF',
                                    marginBottom: '8px'
                                }}>
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.pickupDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    className="form-input"
                                />
                                {errors.pickupDate && (
                                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                                        {errors.pickupDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#9CA3AF',
                                    marginBottom: '8px'
                                }}>
                                    Time
                                </label>
                                <select
                                    value={formData.pickupTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                                    className="form-input"
                                >
                                    <option value="">Select time</option>
                                    {timeSlots.map((slot) => (
                                        <option key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.pickupTime && (
                                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                                        {errors.pickupTime}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Package Type Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            📦 Package Type
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }}>
                            {packageTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFormData(prev => ({ ...prev, packageType: type.id as 'small' | 'medium' | 'large' | 'document' }))}
                                    style={{
                                        padding: '16px 12px',
                                        background: formData.packageType === type.id ?
                                            'linear-gradient(135deg, #f97316, #ea580c)' :
                                            'rgba(255, 255, 255, 0.05)',
                                        border: formData.packageType === type.id ?
                                            '2px solid #f97316' :
                                            '2px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                                        {type.icon}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                        {type.label}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                        {type.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Special Instructions */}
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '20px'
                        }}>
                            📝 Special Instructions (Optional)
                        </h3>

                        <textarea
                            value={formData.specialInstructions}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                            placeholder="Any special instructions for pickup or delivery..."
                            className="form-input h-24"
                            maxLength={200}
                        />
                        <div style={{
                            textAlign: 'right',
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#9CA3AF'
                        }}>
                            {formData.specialInstructions.length}/200 characters
                        </div>
                    </div>

                    {/* Schedule Button */}
                    <button
                        onClick={handleSchedule}
                        className="btn-primary"
                        disabled={buttonLoading}
                        style={{ width: '100%' }}
                    >
                        {buttonLoading ? 'Scheduling...' : 'Schedule Delivery'}
                    </button>
                </div>

                <NavigationWrapper />
            </div>
        </PhoneWrapper>
    );
} 