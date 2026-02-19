'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Avatar, Stack, Chip } from '@mui/material';
import { Star, LocationOn } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import { Picker } from '@/types/picker';
import { Button } from '../ui';

// Custom marker icons
const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const fromLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Distance color helper
function getDistanceColor(distance: number): string {
  if (distance < 2) return '#4caf50'; // green
  if (distance < 5) return '#ff9800'; // orange
  return '#f44336'; // red
}

function getDistanceLabel(distance: number): string {
  if (distance < 2) return 'Nearby';
  if (distance < 5) return 'Close';
  return 'Far';
}

interface PickersMapProps {
  pickers: Picker[];
  fromLocation: { lat: number; lng: number } | null;
  onSelectPicker: (pickerId: string) => void;
  onChatPicker: (pickerId: string) => void;
  searchRadius?: number; // in kilometers
}

export default function PickersMap({ pickers, fromLocation, onSelectPicker, onChatPicker, searchRadius = 10 }: PickersMapProps) {
  // Determine map center
  const getMapCenter = (): [number, number] => {
    if (fromLocation) {
      return [fromLocation.lat, fromLocation.lng];
    }
    // Find center from pickers
    if (pickers.length > 0) {
      const pickerWithLocation = pickers.find(p => p.location);
      if (pickerWithLocation?.location) {
        return [pickerWithLocation.location.lat, pickerWithLocation.location.lng];
      }
    }
    return [53.9006, 27.5590]; // Default (Minsk)
  };

  const mapCenter = getMapCenter();

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height: '100%', width: '100%', minHeight: 400 }}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* From location marker (pickup point) */}
      {fromLocation && (
        <>
          <Marker
            position={[fromLocation.lat, fromLocation.lng]}
            icon={fromLocationIcon}
          >
            <Popup>
              <Box sx={{ minWidth: 150 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <LocationOn fontSize="small" color="success" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Pickup Location
                  </Typography>
                </Stack>
                <Typography variant="caption">
                  Your package pickup point
                </Typography>
              </Box>
            </Popup>
          </Marker>

          {/* Search radius circle */}
          <Circle
            center={[fromLocation.lat, fromLocation.lng]}
            radius={searchRadius * 1000} // Convert km to meters
            pathOptions={{
              color: '#2196f3',
              fillColor: '#2196f3',
              fillOpacity: 0.1,
              weight: 1
            }}
          />
        </>
      )}

      {/* Picker markers */}
      {pickers.map((picker) => {
        if (!picker.location) return null;

        return (
          <Marker
            key={picker.id}
            position={[picker.location.lat, picker.location.lng]}
            icon={pickerIcon}
          >
            <Popup>
              <Box sx={{ minWidth: 200, textAlign: 'center' }}>
                <Avatar
                  src={picker.avatarUrl}
                  sx={{ width: 50, height: 50, mx: 'auto', mb: 1 }}
                >
                  {picker.fullName.charAt(0)}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {picker.fullName}
                </Typography>

                {/* Rating */}
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                  <Typography variant="caption">
                    {picker.rating ? Number(picker.rating).toFixed(1) : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({picker.reviewCount || 0})
                  </Typography>
                </Stack>

                {/* Distance & Price */}
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
                  <Chip
                    label={`${picker.distance} km`}
                    size="small"
                    sx={{
                      backgroundColor: getDistanceColor(picker.distance),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                  <Chip
                    label={`${picker.price} zl`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Stack>

                {/* Estimated time */}
                {picker.estimatedTime && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    ~{picker.estimatedTime} min
                  </Typography>
                )}

                {/* Actions */}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatPicker(picker.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    sx={{ fontSize: '0.7rem', py: 0.5 }}
                  >
                    Chat
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPicker(picker.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    sx={{ fontSize: '0.7rem', py: 0.5 }}
                  >
                    Select
                  </Button>
                </Stack>
              </Box>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
