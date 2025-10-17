'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, ToggleButtonGroup, ToggleButton, Alert } from '@mui/material';
import { LocationOn, Flag } from '@mui/icons-material';
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
}

interface Props {
  onFromLocationSelect: (location: LocationData) => void;
  onToLocationSelect: (location: LocationData) => void;
  initialFromLocation?: LocationData;
  initialToLocation?: LocationData;
}

export default function DualLocationPicker({
  onFromLocationSelect,
  onToLocationSelect,
  initialFromLocation,
  initialToLocation
}: Props) {
  const [fromLocation, setFromLocation] = useState<LocationData | null>(initialFromLocation || null);
  const [toLocation, setToLocation] = useState<LocationData | null>(initialToLocation || null);
  const [activeMarker, setActiveMarker] = useState<'from' | 'to'>('from');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reverse geocoding using Nominatim (OpenStreetMap)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<{ address: string; city?: string }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || undefined;

      return { address, city };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: undefined
      };
    }
  };

  function MapClickHandler() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setLoading(true);
        setError('');

        try {
          const { address, city } = await getAddressFromCoordinates(lat, lng);
          const locationData: LocationData = { lat, lng, address, city };

          if (activeMarker === 'from') {
            setFromLocation(locationData);
            onFromLocationSelect(locationData);
          } else {
            setToLocation(locationData);
            onToLocationSelect(locationData);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Select marker type, then click on the map
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

        {fromLocation && (
          <Marker position={[fromLocation.lat, fromLocation.lng]} icon={fromIcon} />
        )}

        {toLocation && (
          <Marker position={[toLocation.lat, toLocation.lng]} icon={toIcon} />
        )}

        {fromLocation && toLocation && (
          <Polyline
            positions={[
              [fromLocation.lat, fromLocation.lng],
              [toLocation.lat, toLocation.lng]
            ]}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>

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
