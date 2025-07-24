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
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const mapRef = useRef<HTMLDivElement>(null);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const map = useRef<google.maps.Map | null>(null);
    const marker = useRef<google.maps.Marker | null>(null);

    // Initialize Google Maps services
    useEffect(() => {
        const initializeGoogleMaps = async () => {
            try {
                const loader = new Loader({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBHzlPOOQsJhR8XTg7HxVz-mdoOk5o-M4w', // Placeholder key
                    version: 'weekly',
                    libraries: ['places', 'geometry']
                });

                await loader.load();

                autocompleteService.current = new google.maps.places.AutocompleteService();

                // Create a dummy div for PlacesService
                const dummyMap = new google.maps.Map(document.createElement('div'));
                placesService.current = new google.maps.places.PlacesService(dummyMap);
            } catch (error) {
                console.error('Error loading Google Maps:', error);
            }
        };

        initializeGoogleMaps();
    }, []);

    // Handle input change and autocomplete
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (newValue.length > 2 && autocompleteService.current) {
            setIsLoading(true);
            autocompleteService.current.getPlacePredictions(
                {
                    input: newValue,
                    componentRestrictions: { country: 'pl' }, // Restrict to Poland
                },
                (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
                    setIsLoading(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                }
            );
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion: google.maps.places.AutocompletePrediction) => {
        onChange(suggestion.description);
        setShowSuggestions(false);

        // Get place details
        if (placesService.current) {
            placesService.current.getDetails(
                { placeId: suggestion.place_id },
                (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        onChange(suggestion.description, place);
                    }
                }
            );
        }
    };

    // Initialize map in modal
    const initializeMap = () => {
        if (!mapRef.current) return;

        map.current = new google.maps.Map(mapRef.current, {
            center: { lat: 52.237049, lng: 21.017532 }, // Warsaw center
            zoom: 13,
            styles: [
                {
                    "featureType": "all",
                    "stylers": [{ "saturation": -100 }]
                }
            ]
        });

        // Add click listener to map
        map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                placeMarker(e.latLng);
                reverseGeocode(e.latLng);
            }
        });
    };

    // Place marker on map
    const placeMarker = (location: google.maps.LatLng) => {
        if (marker.current) {
            marker.current.setMap(null);
        }

        marker.current = new google.maps.Marker({
            position: location,
            map: map.current,
            draggable: true
        });

        // Add drag listener
        marker.current.addListener('dragend', () => {
            if (marker.current) {
                reverseGeocode(marker.current.getPosition()!);
            }
        });
    };

    // Reverse geocode to get address
    const reverseGeocode = (location: google.maps.LatLng) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === 'OK' && results && results[0]) {
                onChange(results[0].formatted_address, results[0] as any);
            }
        });
    };

    // Open map modal
    const openMapModal = () => {
        setIsMapModalOpen(true);
        setTimeout(initializeMap, 100); // Wait for modal to render
    };

    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className={`form-input flex-1 ${error ? 'border-red-500' : ''}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleInputChange}
                        onFocus={() => value.length > 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    <button
                        type="button"
                        onClick={openMapModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        📍
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-10">
                        {isLoading && (
                            <div className="p-3 text-center text-gray-400">Loading...</div>
                        )}
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.place_id}
                                type="button"
                                className="w-full text-left p-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                                onClick={() => handleSuggestionSelect(suggestion)}
                            >
                                <div className="text-white font-medium">
                                    {suggestion.structured_formatting.main_text}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {suggestion.structured_formatting.secondary_text}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Modal */}
            {isMapModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Select Location</h3>
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div
                            ref={mapRef}
                            className="w-full h-80 rounded-lg"
                        />

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 