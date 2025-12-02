'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Stack, Chip, CircularProgress } from '@mui/material';
import { LocationOn, Person, LocalShipping } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryTrackingMapProps {
  pickupLocation?: Location;
  dropoffLocation?: Location;
  pickerLocation?: Location;
  pickerName?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  userRole: 'sender' | 'picker' | null;
  fromAddress?: string;
  toAddress?: string;
}

export default function DeliveryTrackingMap({
  pickupLocation,
  dropoffLocation,
  pickerLocation,
  pickerName,
  status,
  userRole,
  fromAddress,
  toAddress,
}: DeliveryTrackingMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([53.9006, 27.5590]); // Default Minsk

  useEffect(() => {
    // Determine map center based on available locations and status
    if (userRole === 'picker') {
      // Picker sees pickup first, then dropoff when picked up
      if (status === 'picked_up' && dropoffLocation) {
        setMapCenter([dropoffLocation.lat, dropoffLocation.lng]);
      } else if (pickupLocation) {
        setMapCenter([pickupLocation.lat, pickupLocation.lng]);
      }
    } else {
      // Sender/receiver sees picker location if available, otherwise pickup
      if (pickerLocation) {
        setMapCenter([pickerLocation.lat, pickerLocation.lng]);
      } else if (pickupLocation) {
        setMapCenter([pickupLocation.lat, pickupLocation.lng]);
      }
    }
  }, [pickupLocation, dropoffLocation, pickerLocation, status, userRole]);

  // No locations available
  if (!pickupLocation && !dropoffLocation) {
    return (
      <Box sx={{
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        borderRadius: 1,
      }}>
        <Typography variant="body2" color="text.secondary">
          Location data not available
        </Typography>
      </Box>
    );
  }

  // Build route line
  const routePoints: [number, number][] = [];
  if (pickupLocation) routePoints.push([pickupLocation.lat, pickupLocation.lng]);
  if (dropoffLocation) routePoints.push([dropoffLocation.lat, dropoffLocation.lng]);

  return (
    <Box sx={{ height: 300, borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Route line */}
        {routePoints.length === 2 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#2196f3',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Pickup marker */}
        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <Box sx={{ minWidth: 150 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <LocationOn fontSize="small" sx={{ color: 'success.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Pickup
                  </Typography>
                </Stack>
                <Typography variant="caption">
                  {fromAddress || 'Pickup location'}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Dropoff marker */}
        {dropoffLocation && (
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>
              <Box sx={{ minWidth: 150 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <LocationOn fontSize="small" sx={{ color: 'error.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Dropoff
                  </Typography>
                </Stack>
                <Typography variant="caption">
                  {toAddress || 'Dropoff location'}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Picker location marker */}
        {pickerLocation && (status === 'accepted' || status === 'picked_up') && (
          <Marker position={[pickerLocation.lat, pickerLocation.lng]} icon={pickerIcon}>
            <Popup>
              <Box sx={{ minWidth: 150 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Person fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {pickerName || 'Picker'}
                  </Typography>
                </Stack>
                <Chip
                  icon={<LocalShipping sx={{ fontSize: 14 }} />}
                  label={status === 'picked_up' ? 'In Transit' : 'On the way to pickup'}
                  size="small"
                  color={status === 'picked_up' ? 'primary' : 'info'}
                  sx={{ fontSize: '0.65rem' }}
                />
              </Box>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </Box>
  );
}
