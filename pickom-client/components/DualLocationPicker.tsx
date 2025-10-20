'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton, Alert, Chip, TextField, Autocomplete, CircularProgress } from '@mui/material';
import { LocationOn, Flag, DirectionsCar, Schedule } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const fromIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const toIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface RouteInfo {
  distance: string;
  duration: string;
  coordinates: [number, number][];
}

interface Props {
  onFromLocationSelect: (location: LocationData) => void;
  onToLocationSelect: (location: LocationData) => void;
  initialFromLocation?: LocationData;
  initialToLocation?: LocationData;
  onRouteCalculated?: (routeInfo: RouteInfo) => void;
  deliveryType?: 'within-city' | 'inter-city' | 'international';
}

export default function DualLocationPicker({
  onFromLocationSelect,
  onToLocationSelect,
  initialFromLocation,
  initialToLocation,
  onRouteCalculated,
  deliveryType = 'within-city'
}: Props) {
  const [fromLocation, setFromLocation] = useState<LocationData | null>(initialFromLocation || null);
  const [toLocation, setToLocation] = useState<LocationData | null>(initialToLocation || null);
  const [activeMarker, setActiveMarker] = useState<'from' | 'to'>('from');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [restrictionType, setRestrictionType] = useState<'city' | 'country' | null>(null);
  const [restrictionValue, setRestrictionValue] = useState<string | null>(null);

  // Address autocomplete states
  const [fromAddressInput, setFromAddressInput] = useState('');
  const [toAddressInput, setToAddressInput] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<AddressSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingFromSuggestions, setLoadingFromSuggestions] = useState(false);
  const [loadingToSuggestions, setLoadingToSuggestions] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Set restriction type based on delivery type
  useEffect(() => {
    if (deliveryType === 'within-city') {
      setRestrictionType('city');
    } else if (deliveryType === 'inter-city') {
      setRestrictionType('country');
    } else {
      setRestrictionType(null);
    }
  }, [deliveryType]);

  // Update internal state when initial locations change (e.g., when Clear button is clicked)
  useEffect(() => {
    setFromLocation(initialFromLocation || null);
    setToLocation(initialToLocation || null);
    setFromAddressInput(initialFromLocation?.address || '');
    setToAddressInput(initialToLocation?.address || '');
  }, [initialFromLocation, initialToLocation]);

  // Update restriction value when locations or restriction type changes
  useEffect(() => {
    if (initialFromLocation) {
      if (restrictionType === 'city' && initialFromLocation.city) {
        setRestrictionValue(initialFromLocation.city);
      } else if (restrictionType === 'country' && initialFromLocation.country) {
        setRestrictionValue(initialFromLocation.country);
      }
    } else if (initialToLocation) {
      if (restrictionType === 'city' && initialToLocation.city) {
        setRestrictionValue(initialToLocation.city);
      } else if (restrictionType === 'country' && initialToLocation.country) {
        setRestrictionValue(initialToLocation.country);
      }
    } else {
      // Clear restriction when both locations are null
      setRestrictionValue(null);
    }
  }, [initialFromLocation, initialToLocation, restrictionType]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Search for address suggestions using Nominatim
  const searchAddress = async (query: string, type: 'from' | 'to') => {
    if (!query || query.length < 3) {
      if (type === 'from') {
        setFromSuggestions([]);
      } else {
        setToSuggestions([]);
      }
      return;
    }

    const setLoading = type === 'from' ? setLoadingFromSuggestions : setLoadingToSuggestions;
    const setSuggestions = type === 'from' ? setFromSuggestions : setToSuggestions;

    setLoading(true);

    try {
      // Build search query with restrictions if applicable
      let searchQuery = query;
      if (restrictionType === 'city' && restrictionValue) {
        searchQuery = `${query}, ${restrictionValue}`;
      } else if (restrictionType === 'country' && restrictionValue) {
        searchQuery = `${query}, ${restrictionValue}`;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5&accept-language=en`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );

      const data: AddressSuggestion[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce address search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAddressInput) {
        searchAddress(fromAddressInput, 'from');
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAddressInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toAddressInput) {
        searchAddress(toAddressInput, 'to');
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toAddressInput]);

  // Calculate route using OSRM API
  const calculateRoute = async (from: LocationData, to: LocationData) => {
    setCalculatingRoute(true);
    setError('');

    try {
      // OSRM API endpoint for driving route
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Could not calculate route');
      }

      const route = data.routes[0];
      const coordinates: [number, number][] = route.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]] // OSRM returns [lng, lat], we need [lat, lng]
      );

      // For international deliveries, check if the route actually reaches the destination
      if (restrictionType === null && coordinates.length > 0) {
        const lastPoint = coordinates[coordinates.length - 1];
        const distanceToDestination = Math.sqrt(
          Math.pow(lastPoint[0] - to.lat, 2) + Math.pow(lastPoint[1] - to.lng, 2)
        );

        // If route doesn't reach destination (more than ~1km away), don't show it
        // 0.01 degrees is roughly 1km
        if (distanceToDestination > 0.01) {
          console.log('Route does not reach destination, hiding route');
          setRouteCoordinates([]);
          setRouteInfo(null);
          setCalculatingRoute(false);
          return;
        }
      }

      // Calculate distance and duration
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.round(route.duration / 60);

      const routeData: RouteInfo = {
        distance: `${distanceKm} km`,
        duration: `${durationMin} min`,
        coordinates
      };

      setRouteCoordinates(coordinates);
      setRouteInfo(routeData);

      // Call optional callback
      if (onRouteCalculated) {
        onRouteCalculated(routeData);
      }
    } catch (err) {
      console.error('Route calculation error:', err);

      // For international delivery (no restriction), silently fail without showing error
      // For within-city and inter-city, show error and fallback to straight line
      if (restrictionType !== null) {
        setError('Could not calculate route. Showing straight line.');
        // Fallback to straight line
        setRouteCoordinates([
          [from.lat, from.lng],
          [to.lat, to.lng]
        ]);
      } else {
        // For international, just don't show any route
        setRouteCoordinates([]);
      }

      setRouteInfo(null);
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Update route when both locations are set
  useEffect(() => {
    if (fromLocation && toLocation) {
      calculateRoute(fromLocation, toLocation);
    } else {
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocation, toLocation]);

  // Reverse geocoding using Nominatim (OpenStreetMap)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<{ address: string; city?: string; country?: string; isLand: boolean }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await response.json();

      // If geocoding failed (e.g., ocean/water), return as not land
      if (data.error) {
        return {
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          city: undefined,
          country: undefined,
          isLand: false
        };
      }

      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || undefined;
      const country = data.address?.country || undefined;

      // Check if location is on land (has address components or is not water)
      const isLand = !!(data.address && (
        data.address.country ||
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state ||
        data.address.county ||
        data.address.road ||
        data.address.postcode
      )) && data.type !== 'sea' && data.type !== 'ocean';

      return { address, city, country, isLand };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: undefined,
        country: undefined,
        isLand: false
      };
    }
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = async (suggestion: AddressSuggestion | null, type: 'from' | 'to') => {
    if (!suggestion) return;

    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const address = suggestion.display_name;
    const city = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || suggestion.address?.state;
    const country = suggestion.address?.country;

    setLoading(true);
    setError('');

    try {
      // For international delivery, check if location is on land
      if (!restrictionType) {
        const { isLand } = await getAddressFromCoordinates(lat, lng);
        if (!isLand) {
          setError('Please select a location on land. Water/ocean locations are not allowed.');
          setLoading(false);
          return;
        }
      }

      // Check restriction based on type
      if (restrictionType && restrictionValue) {
        if (restrictionType === 'city') {
          if (!city) {
            setError('Could not determine city. Please select a more specific location.');
            setLoading(false);
            return;
          }
          if (city !== restrictionValue) {
            setError(`You can only select locations within ${restrictionValue}. Selected location is in ${city}.`);
            setLoading(false);
            return;
          }
        } else if (restrictionType === 'country') {
          if (!country) {
            setError('Could not determine country. Please select a more specific location.');
            setLoading(false);
            return;
          }
          if (country !== restrictionValue) {
            setError(`You can only select locations within ${restrictionValue}. Selected location is in ${country}.`);
            setLoading(false);
            return;
          }
        }
      }

      const locationData: LocationData = { lat, lng, address, city, country };

      if (type === 'from') {
        setFromLocation(locationData);
        onFromLocationSelect(locationData);
        setFromAddressInput(address);
        // Set restriction value when first location is selected
        if (restrictionType === 'city' && city) {
          setRestrictionValue(city);
        } else if (restrictionType === 'country' && country) {
          setRestrictionValue(country);
        }
      } else {
        setToLocation(locationData);
        onToLocationSelect(locationData);
        setToAddressInput(address);
      }

      // Center map on the selected location
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 13);
      }
    } catch (err) {
      setError('Failed to set location. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  function MapClickHandler() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setLoading(true);
        setError('');

        try {
          const { address, city, country, isLand } = await getAddressFromCoordinates(lat, lng);

          // For international delivery, check if location is on land
          if (!restrictionType && !isLand) {
            setError('Please select a location on land. Water/ocean locations are not allowed.');
            setLoading(false);
            return;
          }

          // Check restriction based on type
          if (restrictionType && restrictionValue) {
            if (restrictionType === 'city') {
              if (!city) {
                setError('Could not determine city. Please select a more specific location.');
                setLoading(false);
                return;
              }
              if (city !== restrictionValue) {
                setError(`You can only select locations within ${restrictionValue}. Selected location is in ${city}.`);
                setLoading(false);
                return;
              }
            } else if (restrictionType === 'country') {
              if (!country) {
                setError('Could not determine country. Please select a more specific location.');
                setLoading(false);
                return;
              }
              if (country !== restrictionValue) {
                setError(`You can only select locations within ${restrictionValue}. Selected location is in ${country}.`);
                setLoading(false);
                return;
              }
            }
          }

          const locationData: LocationData = { lat, lng, address, city, country };

          if (activeMarker === 'from') {
            setFromLocation(locationData);
            onFromLocationSelect(locationData);
            setFromAddressInput(address);
            // Set restriction value when first location is selected
            if (restrictionType === 'city' && city) {
              setRestrictionValue(city);
            } else if (restrictionType === 'country' && country) {
              setRestrictionValue(country);
            }
          } else {
            setToLocation(locationData);
            onToLocationSelect(locationData);
            setToAddressInput(address);
          }
        } catch (err) {
          setError('Failed to get address. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
    });

    return null;
  }

  // Component to access map instance
  function MapInstanceHandler() {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    return null;
  }

  if (!isMounted) {
    return (
      <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading map...
        </Typography>
      </Box>
    );
  }

  const centerLat = fromLocation?.lat || toLocation?.lat || 52.2297;
  const centerLng = fromLocation?.lng || toLocation?.lng || 21.0122;

  return (
    <Box>
      {/* Address Input Fields */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Autocomplete
          freeSolo
          options={fromSuggestions}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
          inputValue={fromAddressInput}
          onInputChange={(_, newValue) => setFromAddressInput(newValue)}
          onChange={(_, newValue) => {
            if (typeof newValue !== 'string') {
              handleAddressSelect(newValue, 'from');
            }
          }}
          loading={loadingFromSuggestions}
          renderInput={(params) => (
            <TextField
              {...params}
              label="From Address"
              placeholder="Type to search address..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: <LocationOn sx={{ color: 'success.main', mr: 1 }} />,
                endAdornment: (
                  <>
                    {loadingFromSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.lat + option.lon}>
              <Typography variant="body2">{option.display_name}</Typography>
            </Box>
          )}
        />

        <Autocomplete
          freeSolo
          options={toSuggestions}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
          inputValue={toAddressInput}
          onInputChange={(_, newValue) => setToAddressInput(newValue)}
          onChange={(_, newValue) => {
            if (typeof newValue !== 'string') {
              handleAddressSelect(newValue, 'to');
            }
          }}
          loading={loadingToSuggestions}
          renderInput={(params) => (
            <TextField
              {...params}
              label="To Address"
              placeholder="Type to search address..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: <Flag sx={{ color: 'error.main', mr: 1 }} />,
                endAdornment: (
                  <>
                    {loadingToSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.lat + option.lon}>
              <Typography variant="body2">{option.display_name}</Typography>
            </Box>
          )}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Or select marker type and click on the map
          </Typography>

          <ToggleButtonGroup
            value={activeMarker}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setActiveMarker(newValue);
              }
            }}
            size="small"
            sx={{ backgroundColor: 'background.paper' }}
          >
            <ToggleButton value="from" aria-label="from location">
              <LocationOn sx={{ mr: 0.5, fontSize: '18px', color: 'success.main' }} />
              <Typography variant="caption">From</Typography>
            </ToggleButton>
            <ToggleButton value="to" aria-label="to location">
              <Flag sx={{ mr: 0.5, fontSize: '18px', color: 'error.main' }} />
              <Typography variant="caption">To</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {restrictionValue && restrictionType && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={`${restrictionType === 'city' ? 'City' : 'Country'}: ${restrictionValue}`}
              color={restrictionType === 'city' ? 'success' : 'primary'}
              size="small"
              onDelete={() => {
                setRestrictionValue(null);
                setFromLocation(null);
                setToLocation(null);
                setRouteCoordinates([]);
                setRouteInfo(null);
                setError('');
                setFromAddressInput('');
                setToAddressInput('');
              }}
            />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Getting address...
        </Alert>
      )}

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{
          height: '400px',
          width: '100%',
          borderRadius: '8px',
          zIndex: 0
        }}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <MapInstanceHandler />

        {fromLocation && (
          <Marker position={[fromLocation.lat, fromLocation.lng]} icon={fromIcon} />
        )}

        {toLocation && (
          <Marker position={[toLocation.lat, toLocation.lng]} icon={toIcon} />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {calculatingRoute && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Calculating route...
        </Alert>
      )}

      {routeInfo && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Chip
            icon={<DirectionsCar />}
            label={routeInfo.distance}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Schedule />}
            label={routeInfo.duration}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Paper sx={{ p: 1.5, backgroundColor: fromLocation ? 'success.lighter' : 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <LocationOn sx={{ color: 'success.main', mt: 0.2 }} fontSize="small" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" fontWeight={600} display="block">
                From:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fromLocation ? fromLocation.address : 'Not selected'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 1.5, backgroundColor: toLocation ? 'error.lighter' : 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Flag sx={{ color: 'error.main', mt: 0.2 }} fontSize="small" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" fontWeight={600} display="block">
                To:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {toLocation ? toLocation.address : 'Not selected'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
