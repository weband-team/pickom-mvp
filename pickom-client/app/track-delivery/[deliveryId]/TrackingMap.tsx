'use client';

import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Avatar, Stack } from '@mui/material';
import { LocationOn, Flag, Star } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import { DeliveryRequest } from '@/app/api/delivery';
import { User } from '@/app/api/dto/user';

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

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PickerLocation {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  coordinates: [number, number][];
}

interface TrackingMapProps {
  delivery: DeliveryRequest;
  picker: User | null;
  pickerLocation: PickerLocation | null;
  route: RouteInfo | null;
}

export default function TrackingMap({ delivery, picker, pickerLocation, route }: TrackingMapProps) {
  // Determine map center based on what's available
  const getMapCenter = (): [number, number] => {
    if (pickerLocation && delivery.status === 'picked_up') {
      return [pickerLocation.lat, pickerLocation.lng];
    }
    if (delivery.toLocation) {
      return [delivery.toLocation.lat, delivery.toLocation.lng];
    }
    if (delivery.fromLocation) {
      return [delivery.fromLocation.lat, delivery.fromLocation.lng];
    }
    return [53.9006, 27.5590]; // Default (Minsk)
  };

  const mapCenter = getMapCenter();

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* From marker (green) - Pickup location */}
      {delivery.fromLocation && (
        <Marker
          position={[delivery.fromLocation.lat, delivery.fromLocation.lng]}
          icon={fromIcon}
        >
          <Popup>
            <Box sx={{ minWidth: 150 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <LocationOn fontSize="small" color="success" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Pickup Location
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {delivery.fromLocation.address}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      )}

      {/* To marker (red) - Delivery destination */}
      {delivery.toLocation && (
        <Marker
          position={[delivery.toLocation.lat, delivery.toLocation.lng]}
          icon={toIcon}
        >
          <Popup>
            <Box sx={{ minWidth: 150 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Flag fontSize="small" color="error" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Delivery Destination
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {delivery.toLocation.address}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      )}

      {/* Picker marker (blue) - Current picker location */}
      {pickerLocation && picker && (
        <Marker
          position={[pickerLocation.lat, pickerLocation.lng]}
          icon={pickerIcon}
        >
          <Popup>
            <Box sx={{ minWidth: 180, textAlign: 'center' }}>
              <Avatar
                src={picker.avatarUrl}
                sx={{ width: 50, height: 50, mx: 'auto', mb: 1 }}
              >
                {picker.name.charAt(0)}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {picker.name}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                <Typography variant="caption">
                  {picker.rating ? Number(picker.rating).toFixed(1) : 'N/A'}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {picker.completedDeliveries || 0} deliveries
              </Typography>
              {pickerLocation.timestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.5 }}>
                  Updated: {new Date(pickerLocation.timestamp).toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Popup>
        </Marker>
      )}

      {/* Route polyline - from picker to destination */}
      {route?.coordinates && route.coordinates.length > 0 && (
        <Polyline
          positions={route.coordinates}
          color="#2196f3"
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  );
}
