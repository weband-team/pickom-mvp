'use client';

import { useState, useEffect, useRef } from 'react';
import LocationInput from './LocationInput';

interface CityLocationInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    deliveryType: 'Intra-City' | 'Inter-City';
}

// Список популярных городов Польши для междугородской доставки
const cities = [
    'Warsaw',
    'Kraków',
    'Łódź',
    'Wrocław',
    'Poznań',
    'Gdańsk',
    'Szczecin',
    'Bydgoszcz',
    'Lublin',
    'Białystok',
    'Katowice',
    'Gdynia',
    'Częstochowa',
    'Radom',
    'Sosnowiec',
    'Toruń',
    'Kielce',
    'Gliwice',
    'Zabrze',
    'Bytom'
];

export default function CityLocationInput({
    label,
    placeholder,
    value,
    onChange,
    deliveryType
}: CityLocationInputProps) {
    const [selectedCity, setSelectedCity] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [step, setStep] = useState<'city' | 'address'>('city');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const previousValueRef = useRef(value);
    const isUpdatingFromPropsRef = useRef(false);

    // Filter cities based on search term
    const filteredCities = cities.filter(city =>
        city.toLowerCase().includes(citySearchTerm.toLowerCase())
    );

    // Parse incoming value changes (from parent component)
    useEffect(() => {
        if (value !== previousValueRef.current && !isUpdatingFromPropsRef.current) {
            previousValueRef.current = value;

            if (value && value.includes(',')) {
                const parts = value.split(',');
                if (parts.length >= 2) {
                    const cityPart = parts[parts.length - 1].trim();
                    const addressPart = parts.slice(0, -1).join(',').trim();

                    if (cities.includes(cityPart)) {
                        isUpdatingFromPropsRef.current = true;
                        setSelectedCity(cityPart);
                        setStreetAddress(addressPart);
                        setStep('address');
                        setCitySearchTerm(cityPart);
                        isUpdatingFromPropsRef.current = false;
                    }
                }
            } else if (!value) {
                // Reset when value is cleared
                isUpdatingFromPropsRef.current = true;
                setSelectedCity('');
                setStreetAddress('');
                setStep('city');
                setCitySearchTerm('');
                isUpdatingFromPropsRef.current = false;
            }
        }
    }, [value]);

    // Update parent value when internal state changes (but not when updating from props)
    useEffect(() => {
        if (!isUpdatingFromPropsRef.current) {
            const newValue = selectedCity && streetAddress
                ? `${streetAddress}, ${selectedCity}`
                : selectedCity && step === 'city'
                    ? selectedCity
                    : '';

            if (newValue !== previousValueRef.current) {
                previousValueRef.current = newValue;
                onChange(newValue);
            }
        }
    }, [selectedCity, streetAddress, step]);

    const handleCitySelect = (city: string) => {
        setSelectedCity(city);
        setCitySearchTerm(city);
        setShowCityDropdown(false);
        setStep('address');
    };

    const handleBackToCity = () => {
        setStep('city');
        setStreetAddress('');
        setCitySearchTerm(selectedCity);
    };

    const handleStreetAddressChange = (address: string) => {
        setStreetAddress(address);
    };

    return (
        <>
            {/* For intra-city deliveries, use the regular LocationInput (city is already known) */}
            {deliveryType === 'Intra-City' ? (
                <LocationInput
                    label={label}
                    placeholder={placeholder}
                    value={value}
                    onChange={(value) => onChange(value)}
                />
            ) : (
                /* For inter-city deliveries, use city selection */
                <div style={{ marginBottom: '8px' }}>
                    {/* Label */}
                    <label style={{
                        display: 'block',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#9CA3AF',
                        marginBottom: '8px'
                    }}>
                        {label}
                    </label>

                    {step === 'city' ? (
                        /* City Selection Step */
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={citySearchTerm}
                                    onChange={(e) => {
                                        setCitySearchTerm(e.target.value);
                                        setShowCityDropdown(true);
                                    }}
                                    placeholder="Select your city..."
                                    style={{
                                        width: '100%',
                                        padding: '16px 50px 16px 20px',
                                        background: '#1f2937',
                                        border: '2px solid #374151',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '400',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden'
                                    }}
                                    onFocus={(e) => {
                                        setShowCityDropdown(true);
                                        const target = e.target as HTMLInputElement;
                                        target.style.borderColor = '#f97316';
                                        target.style.boxShadow = '0 10px 25px -5px rgba(249, 115, 22, 0.25)';
                                        target.style.backgroundColor = '#111827';
                                    }}
                                    onBlur={(e) => {
                                        // Delay hiding dropdown to allow clicking
                                        setTimeout(() => setShowCityDropdown(false), 150);
                                        const target = e.target as HTMLInputElement;
                                        target.style.borderColor = '#374151';
                                        target.style.boxShadow = 'none';
                                        target.style.backgroundColor = '#1f2937';
                                    }}
                                />

                                {/* City Icon */}
                                <div style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '20px',
                                    color: '#9CA3AF'
                                }}>
                                    🏙️
                                </div>
                            </div>

                            {/* City Dropdown */}
                            {showCityDropdown && filteredCities.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    right: '0',
                                    background: 'white',
                                    border: '2px solid #f97316',
                                    borderRadius: '12px',
                                    marginTop: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 1000,
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                                }}>
                                    {filteredCities.map((city) => (
                                        <div
                                            key={city}
                                            onMouseDown={() => handleCitySelect(city)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                color: 'black',
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f97316';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'black';
                                            }}
                                        >
                                            🏙️ {city}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Address Selection Step */
                        <div>
                            {/* Selected City Display */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px',
                                padding: '12px 16px',
                                background: 'rgba(249, 115, 22, 0.1)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                borderRadius: '8px'
                            }}>
                                <span style={{ color: '#f97316', fontWeight: '600', fontSize: '14px' }}>
                                    🏙️ {selectedCity}
                                </span>
                                <button
                                    onClick={handleBackToCity}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#f97316',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        marginLeft: 'auto'
                                    }}
                                >
                                    Change City
                                </button>
                            </div>

                            {/* Street Address Input - Simple input without Google Maps */}
                            <input
                                type="text"
                                value={streetAddress}
                                onChange={(e) => handleStreetAddressChange(e.target.value)}
                                placeholder={`Enter street address in ${selectedCity}...`}
                                className="form-input"
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    );
} 