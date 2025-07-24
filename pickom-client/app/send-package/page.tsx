'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PhoneWrapper from '../components/PhoneWrapper';
import BottomNavigation from '../components/BottomNavigation';
import LocationInput from '../components/LocationInput';
import Toast from '../components/Toast';

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
    const [formData, setFormData] = useState<FormData>({
        pickupLocation: '',
        dropoffLocation: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        toast.success('Locations validated successfully!');

        // Navigate to next page
        setTimeout(() => {
            router.push('/select-traveler');
        }, 500);
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

                {/* Loading overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-white text-lg font-medium">Finding the best routes...</p>
                        </div>
                    </div>
                )}

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
                        <LocationInput
                            label="Pickup Location"
                            value={formData.pickupLocation}
                            onChange={handleLocationChange('pickupLocation')}
                            placeholder="Enter pickup address..."
                            error={errors.pickupLocation}
                        />

                        <LocationInput
                            label="Drop-off Location"
                            value={formData.dropoffLocation}
                            onChange={handleLocationChange('dropoffLocation')}
                            placeholder="Enter drop-off address..."
                            error={errors.dropoffLocation}
                        />

                        <div style={{ marginTop: '40px' }}>
                            <button
                                onClick={handleContinue}
                                className="btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>

                <BottomNavigation />
            </div>
        </PhoneWrapper>
    );
} 