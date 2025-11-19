'use client';

import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Avatar } from '@mui/material';
import { LocationOn, Flag, Star, Phone } from '@mui/icons-material';
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
  address?: string;
  city?: string;
  placeId?: string;
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
  const mapCenter = delivery.toLocation
    ? [delivery.toLocation.lat, delivery.toLocation.lng] as [number, number]
    : [53.9006, 27.5590] as [number, number];

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '60vh', width: '100%' }}
      scrollWheelZoom={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* From marker (green) */}
      {delivery.fromLocation && (
        <Marker
          position={[delivery.fromLocation.lat, delivery.fromLocation.lng]}
          icon={fromIcon}
        >
          <Popup>
            <Box>
              <Typography variant="caption" fontWeight={600} display="block">
                <LocationOn fontSize="small" /> Pickup Location
              </Typography>
              <Typography variant="caption">
                {delivery.fromLocation.address}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      )}

      {/* To marker (red) */}
      {delivery.toLocation && (
        <Marker
          position={[delivery.toLocation.lat, delivery.toLocation.lng]}
          icon={toIcon}
        >
          <Popup>
            <Box>
              <Typography variant="caption" fontWeight={600} display="block">
                <Flag fontSize="small" /> Delivery Location
              </Typography>
              <Typography variant="caption">
                {delivery.toLocation.address}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      )}

      {/* Picker marker (blue) */}
      {pickerLocation && picker && (
        <Marker
          position={[pickerLocation.lat, pickerLocation.lng]}
          icon={pickerIcon}
        >
          <Popup>
            <Box sx={{ textAlign: 'center', minWidth: '150px' }}>
              <Avatar
                src={picker.avatarUrl}
                sx={{ width: 50, height: 50, mx: 'auto', mb: 1 }}
              >
                {picker.name.charAt(0)}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                {picker.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Star fontSize="small" sx={{ color: 'gold' }} />
                <Typography variant="caption">
                  {picker.rating ? Number(picker.rating).toFixed(1) : 'N/A'}
                </Typography>
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <Phone fontSize="small" /> {picker.phone}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {picker.completedDeliveries || 0} deliveries
              </Typography>
            </Box>
          </Popup>
        </Marker>
      )}

      {/* Route polyline */}
      {route?.coordinates && route.coordinates.length > 0 && (
        <Polyline
          positions={route.coordinates}
          color="#2563eb"
          weight={4}
          opacity={0.8}
        />
      )}
    </MapContainer>
  );
}
