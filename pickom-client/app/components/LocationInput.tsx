'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationInputProps {
    label: string;
    value: string;
    onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
    placeholder?: string;
    error?: string;
}

export default function LocationInput({ label, value, onChange, placeholder, error }: LocationInputProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

    // Initialize Google Maps services
    useEffect(() => {
        const initializeGoogleMaps = async () => {
            try {
                const loader = new Loader({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBHzlPOOQsJhR8XTg7HxVz-mdoOk5o-M4w',
                    version: 'weekly',
                    libraries: ['places']
                });

                await loader.load();
                setIsGoogleMapsLoaded(true);
                console.log('✅ Google Maps successfully loaded');
            } catch (error) {
                console.error('❌ Error loading Google Maps:', error);
                console.log('📝 Check your API key and ensure Places API is enabled');
            }
        };

        initializeGoogleMaps();
    }, []);

    // Используем старый API как основной (он работает)
    const tryLegacyAPI = (input: string) => {
        try {
            const autocompleteService = new google.maps.places.AutocompleteService();

            autocompleteService.getPlacePredictions(
                {
                    input: input,
                    componentRestrictions: { country: 'pl' },
                },
                (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
                    setIsLoading(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                        setShowSuggestions(true);
                        console.log(`✅ Found ${predictions.length} suggestions`);
                    } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                        console.error('🚫 Places API (Legacy) access denied. Please:');
                        console.error('   1. Go to https://console.cloud.google.com/apis/library');
                        console.error('   2. Enable "Places API" (without "New")');
                        console.error('   3. Check API key restrictions');
                        setSuggestions([]);
                        setShowSuggestions(false);
                    } else {
                        console.warn('⚠️ Places API returned status:', status);
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                }
            );
        } catch (error) {
            console.error('❌ Legacy API error:', error);
            setIsLoading(false);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle input change and autocomplete using legacy API
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (newValue.length > 2 && isGoogleMapsLoaded) {
            setIsLoading(true);

            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

            if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('your_')) {
                console.error('❌ Invalid API key. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local');
                setIsLoading(false);
                return;
            }

            // Используем старый API (он работает надежнее)
            console.log('🔄 Using Legacy Places API...');
            tryLegacyAPI(newValue);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion: any) => {
        onChange(suggestion.description);
        setShowSuggestions(false);

        if (suggestion.place_id) {
            try {
                const placesService = new google.maps.places.PlacesService(document.createElement('div'));

                placesService.getDetails(
                    { placeId: suggestion.place_id },
                    (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                            onChange(suggestion.description, place);
                            console.log('✅ Place details retrieved');
                        } else {
                            console.warn('⚠️ Could not get place details:', status);
                        }
                    }
                );
            } catch (error) {
                console.error('❌ Error getting place details:', error);
            }
        }
    };

    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="relative">
                <div className="relative">
                    <input
                        type="text"
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            backgroundColor: '#1f2937',
                            border: '2px solid #374151',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '400',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            cursor: 'text'
                        }}
                        className="focus:border-orange-500 focus:shadow-lg"
                        placeholder={placeholder}
                        value={value}
                        onChange={handleInputChange}
                        onFocus={(e) => {
                            // При фокусе показываем suggestions если есть
                            if (value.length > 2 && suggestions.length > 0) {
                                setShowSuggestions(true);
                            }
                            // Стили фокуса - оранжевый
                            const target = e.target as HTMLInputElement;
                            target.style.borderColor = '#f97316';
                            target.style.boxShadow = '0 10px 25px -5px rgba(249, 115, 22, 0.25)';
                            target.style.backgroundColor = '#111827';
                        }}
                        onBlur={(e) => {
                            setTimeout(() => setShowSuggestions(false), 200);
                            // Убираем стили фокуса
                            const target = e.target as HTMLInputElement;
                            target.style.borderColor = '#374151';
                            target.style.boxShadow = 'none';
                            target.style.backgroundColor = '#1f2937';
                        }}
                        onMouseEnter={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target !== document.activeElement) {
                                target.style.borderColor = '#ea580c'; // Оранжевый hover
                            }
                        }}
                        onMouseLeave={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (target !== document.activeElement) {
                                target.style.borderColor = '#374151';
                            }
                        }}
                        // Позволяем выделение текста
                        onDoubleClick={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.select();
                        }}
                        title={value} // Показываем полный текст в tooltip при hover
                    />
                </div>

                {error && (
                    <p style={{
                        color: '#ef4444',
                        fontSize: '14px',
                        marginTop: '8px',
                        marginLeft: '4px'
                    }}>
                        {error}
                    </p>
                )}

                {/* Loading indicator */}
                {!isGoogleMapsLoaded && (
                    <p style={{
                        color: '#fbbf24',
                        fontSize: '14px',
                        marginTop: '8px',
                        marginLeft: '4px'
                    }}>
                        Loading Google Maps...
                    </p>
                )}

                {/* Загрузка предложений */}
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            right: '0',
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            marginTop: '8px',
                            zIndex: 50,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                            Searching...
                        </div>
                    </div>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && !isLoading && (
                    <div
                        className="dropdown-suggestions"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            right: '0',
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            marginTop: '8px',
                            maxHeight: '320px',
                            overflow: 'hidden',
                            zIndex: 50,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={suggestion.place_id || index}
                                    type="button"
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '16px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ color: '#6b7280', marginTop: '4px', flexShrink: 0, fontSize: '18px' }}>
                                            📍
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                color: '#111827',
                                                fontWeight: '500',
                                                fontSize: '16px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {suggestion.structured_formatting.main_text}
                                            </div>
                                            {suggestion.structured_formatting.secondary_text && (
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '14px',
                                                    marginTop: '4px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {suggestion.structured_formatting.secondary_text}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div style={{
                            padding: '12px',
                            fontSize: '12px',
                            color: '#9ca3af',
                            textAlign: 'center',
                            borderTop: '1px solid #f3f4f6',
                            backgroundColor: '#f9fafb'
                        }}>
                            Powered by Google
                        </div>
                    </div>
                )}

                {/* Нет результатов */}
                {showSuggestions && suggestions.length === 0 && !isLoading && value.length > 2 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            right: '0',
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '12px',
                            marginTop: '8px',
                            zIndex: 50,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                            No suggestions found
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 