'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PhoneWrapper from '../components/PhoneWrapper';
import NavigationWrapper from '../components/NavigationWrapper';
import CityLocationInput from '../components/CityLocationInput';
import Toast from '../components/Toast';
import { useLoading } from '../context/LoadingContext';

interface FormData {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDetails?: google.maps.places.PlaceResult;
    dropoffDetails?: google.maps.places.PlaceResult;
}

interface FormErrors {
    pickupLocation?: string;
    dropoffLocation?: string;
}

export default function SendPackagePage() {
    const [selectedType, setSelectedType] = useState('Within City');
    const [deliveryType, setDeliveryType] = useState<'Intra-City' | 'Inter-City'>('Intra-City');
    const [formData, setFormData] = useState<FormData>({
        pickupLocation: '',
        dropoffLocation: '',
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
            setSelectedType(typeParam === 'Intra-City' ? 'Within City' : 'Inter-City');
            setDeliveryType(typeParam as 'Intra-City' | 'Inter-City');
        }
    }, [searchParams]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.pickupLocation.trim()) {
            newErrors.pickupLocation = 'Pickup location is required';
        }

        if (!formData.dropoffLocation.trim()) {
            newErrors.dropoffLocation = 'Drop-off location is required';
        }

        if (formData.pickupLocation.trim() === formData.dropoffLocation.trim()) {
            newErrors.dropoffLocation = 'Drop-off location must be different from pickup location';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Show error toast
            const firstError = Object.values(newErrors)[0];
            toast.error(firstError);
            return false;
        }

        return true;
    };

    const handleContinue = async () => {
        if (!validateForm()) {
            return;
        }

        setButtonLoading(true);
        showLoading("Searching for available travelers...");

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setButtonLoading(false);
        hideLoading();
        toast.success('Locations validated successfully!');

        // Navigate to next page
        setTimeout(() => {
            router.push('/select-traveler');
        }, 300);
    };

    const handleLocationChange = (field: 'pickupLocation' | 'dropoffLocation') =>
        (value: string, placeDetails?: google.maps.places.PlaceResult) => {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                [`${field.replace('Location', 'Details')}`]: placeDetails
            }));

            // Clear error when user starts typing
            if (errors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: undefined
                }));
            }
        };

    return (
        <PhoneWrapper>
            <div className="page">
                <Toast />



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
                            marginBottom: '8px'
                        }}>
                            {selectedType === 'Within City' ? '🏠' : '🌍'} {selectedType} Delivery
                        </div>
                    </div>

                    <div className="space-y-6 pb-safe">
                        <div>
                            <CityLocationInput
                                label="Pickup Location"
                                value={formData.pickupLocation}
                                onChange={handleLocationChange('pickupLocation')}
                                placeholder="Enter pickup address..."
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
                                value={formData.dropoffLocation}
                                onChange={handleLocationChange('dropoffLocation')}
                                placeholder="Enter drop-off address..."
                                deliveryType={deliveryType}
                            />
                            {errors.dropoffLocation && (
                                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                                    {errors.dropoffLocation}
                                </p>
                            )}
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <button
                                onClick={handleContinue}
                                className="btn-primary"
                                disabled={buttonLoading}
                            >
                                {buttonLoading ? 'Processing...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>

                <NavigationWrapper />
            </div>
        </PhoneWrapper>
    );
} 