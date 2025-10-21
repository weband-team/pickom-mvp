'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number };
}

export default function LocationPicker({ onLocationSelect, initialPosition }: Props) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialPosition || { lat: 52.2297, lng: 21.0122 } // Warsaw default
  );
  const [isMounted, setIsMounted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Request geolocation on first load if no initial position
  useEffect(() => {
    if (isMounted && !initialPosition && !hasRequestedLocation) {
      setHasRequestedLocation(true);
      requestCurrentLocation();
    }
  }, [isMounted, initialPosition, hasRequestedLocation]);

  // Update position when initialPosition changes
  useEffect(() => {
    if (initialPosition && (initialPosition.lat !== position.lat || initialPosition.lng !== position.lng)) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const requestCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const { latitude, longitude } = geoPosition.coords;
        setPosition({ lat: latitude, lng: longitude });
        onLocationSelect(latitude, longitude);
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setLocationError(errorMessage);
        setLoadingLocation(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  function LocationMarker() {
    const map = useMap();

    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        onLocationSelect(lat, lng);
      },
    });

    // Center map when position changes
    useEffect(() => {
      map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);

    return position ? <Marker position={[position.lat, position.lng]} draggable={false} /> : null;
  }

  if (!isMounted) {
    return (
      <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading map...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Click on the map to set your location
        </Typography>
        <Button
          size="small"
          startIcon={loadingLocation ? <CircularProgress size={16} /> : <MyLocation />}
          onClick={requestCurrentLocation}
          disabled={loadingLocation}
          sx={{ minWidth: 'auto', textTransform: 'none' }}
        >
          {loadingLocation ? 'Getting...' : 'My Location'}
        </Button>
      </Box>

      {locationError && (
        <Paper sx={{ p: 1, mb: 1.5, backgroundColor: 'error.lighter' }}>
          <Typography variant="caption" color="error">
            {locationError}
          </Typography>
        </Paper>
      )}

      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{
          height: '300px',
          width: '100%',
          borderRadius: '8px',
          zIndex: 0
        }}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>

      <Paper sx={{ mt: 1.5, p: 1.5, backgroundColor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          Selected location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </Typography>
      </Paper>
    </Box>
  );
}
