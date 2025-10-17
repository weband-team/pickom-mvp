# Map Routes Context

## Overview
This document provides context for implementing and working with map routing functionality in the Pickom application. The routing feature displays paths between pickup and delivery locations following actual roads rather than straight lines.

## Technologies Used

### Current Implementation: OpenStreetMap + OSRM
- **Leaflet**: Core map rendering library (React-Leaflet)
- **OpenStreetMap (OSM)**: Free map tiles
- **OSRM (Open Source Routing Machine)**: Free routing API
- **Nominatim**: Reverse geocoding (coordinates to address)

**Advantages:**
- ✅ **Free** - No API keys or billing required
- ✅ **No quotas** - Unlimited requests (fair use policy)
- ✅ **Open source** - Full control and transparency
- ✅ **Privacy** - No tracking or data collection

**API Endpoints Used:**
```
Routing: https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}
Geocoding: https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}
```

### Alternative: Google Maps JavaScript API
If you need to switch to Google Maps:
- **Maps JavaScript API**: Core map rendering
- **Directions API**: Route calculation between two points
- **Places API**: Location search and autocomplete
- **Geocoding API**: Address to coordinates conversion

**API Key Configuration:**
```javascript
// Location: pickom-client/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Key Components

### DualLocationPicker Component
**File:** `pickom-client/components/DualLocationPicker.tsx`

**Purpose:** Allows users to select pickup and delivery locations with visual map representation and route display.

**Features:**
- Two location inputs (From/To)
- Interactive map with markers
- Route polyline following roads (using Directions API)
- Distance and duration calculation
- Mobile-optimized interface

### LocationPicker Component
**File:** `pickom-client/components/LocationPicker.tsx`

**Purpose:** Single location selection with autocomplete and map display.

**Features:**
- Address autocomplete
- Current location detection
- Map marker placement
- Geocoding support

## Route Implementation Details

### OSRM Route Calculation (Current Implementation)
```typescript
const calculateRoute = async (from: Location, to: Location) => {
  // OSRM API endpoint for driving route
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.code === 'Ok' && data.routes.length > 0) {
    const route = data.routes[0];

    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: number[]) => [coord[1], coord[0]]
    );

    // Calculate distance and duration
    const distanceKm = (route.distance / 1000).toFixed(1);
    const durationMin = Math.round(route.duration / 60);

    return {
      distance: `${distanceKm} km`,
      duration: `${durationMin} min`,
      coordinates
    };
  }
};
```

### Displaying Route with Leaflet
```typescript
import { Polyline } from 'react-leaflet';

<Polyline
  positions={routeCoordinates}
  color="#2563eb"
  weight={4}
  opacity={0.8}
/>
```

### OSRM Travel Modes
Available profile options in OSRM:
- `driving`: Car routes (default)
- `walking`: Pedestrian routes
- `cycling`: Bicycle routes

**URL Format:**
```
https://router.project-osrm.org/route/v1/{profile}/{coordinates}?overview=full&geometries=geojson
```

### Google Maps Alternative (For Reference)
```typescript
// Google Maps DirectionsService
const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer({
  map: mapInstance,
  suppressMarkers: true,
  polylineOptions: {
    strokeColor: '#4CAF50',
    strokeWeight: 4,
    strokeOpacity: 0.8
  }
});

directionsService.route(
  {
    origin: { lat: from.lat, lng: from.lng },
    destination: { lat: to.lat, lng: to.lng },
    travelMode: google.maps.TravelMode.DRIVING
  },
  (result, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    }
  }
);
```

## Data Structure

### Location Interface
```typescript
interface Location {
  lat: number;      // Latitude
  lng: number;      // Longitude
  address: string;  // Full formatted address
  city?: string;    // City name
  placeId?: string; // Google Places ID
}
```

### Route Information
```typescript
interface RouteInfo {
  distance: string;      // e.g., "5.2 km"
  duration: string;      // e.g., "12 mins"
  polyline: string;      // Encoded polyline string
  bounds: LatLngBounds;  // Map bounds for route
}
```

## Usage Examples

### Basic Implementation
```typescript
import DualLocationPicker from '@/components/DualLocationPicker';

function DeliveryForm() {
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);

  return (
    <DualLocationPicker
      onFromLocationSelect={setFromLocation}
      onToLocationSelect={setToLocation}
      initialFromLocation={fromLocation}
      initialToLocation={toLocation}
    />
  );
}
```

### With Route Information Callback
```typescript
<DualLocationPicker
  onFromLocationSelect={setFromLocation}
  onToLocationSelect={setToLocation}
  onRouteCalculated={(routeInfo) => {
    console.log('Distance:', routeInfo.distance);
    console.log('Duration:', routeInfo.duration);
  }}
/>
```

## API Quotas and Limits

### OSRM API (Current Implementation)
- **Free tier**: Unlimited requests
- **Fair use policy**: Don't abuse the service
- **Rate limiting**: Reasonable request frequency
- **Self-hosting option**: Can deploy your own OSRM server

**Usage Guidelines:**
```
✅ DO:
- Use for production applications (fair use)
- Cache results when possible
- Implement reasonable request delays
- Consider self-hosting for high traffic

❌ DON'T:
- Send thousands of requests per minute
- Use for load testing
- Abuse the free service
```

### Google Maps API Limits (Alternative)
- **Directions API**:
  - Free tier: Limited requests per day
  - Paid: $5 per 1000 requests (after free tier)
- **Maps JavaScript API**:
  - Free tier: $200 credit/month
  - Dynamic map loads: $7 per 1000 loads

### Best Practices
1. **Cache routes** when possible to reduce API calls
2. **Debounce** route calculations during user input
3. **Only calculate** when both locations are selected
4. **Store polylines** in database for completed deliveries
5. **Use waypoint optimization** for multiple stops
6. **Implement retry logic** with exponential backoff
7. **Handle errors gracefully** with fallback to straight line

## Database Storage

### Delivery Location Fields
```sql
-- JSONB structure in PostgreSQL
{
  "lat": 55.7558,
  "lng": 37.6173,
  "address": "Red Square, Moscow, Russia",
  "city": "Moscow",
  "placeId": "ChIJybDUc_xKtUYRTM9XV8zWRYE"
}
```

### Optional: Store Route Data
```sql
-- Additional fields for caching routes
route_polyline TEXT,
route_distance_meters INTEGER,
route_duration_seconds INTEGER
```

## Troubleshooting

### Common Issues

1. **Straight line instead of route (OSRM)**
   - Check browser console for OSRM API errors
   - Verify internet connection
   - Check if OSRM service is available: https://router.project-osrm.org/
   - Fallback to straight line is automatic on error

2. **"Could not calculate route" error**
   - Locations may be unreachable by selected travel mode
   - Locations may be in areas without road data
   - Try locations in well-mapped areas first
   - Check OSRM response in browser console

3. **Route not displaying**
   - Verify both locations are selected
   - Check if map is fully initialized
   - Look for JavaScript errors in console
   - Ensure Polyline component receives valid coordinates

4. **CORS errors**
   - OSRM public API allows CORS
   - If self-hosting, configure CORS headers
   - Check browser security settings

5. **Slow route calculation**
   - OSRM is usually fast (<500ms)
   - Check network connection
   - Consider caching calculated routes
   - Implement loading indicators

6. **Route appears jagged or incorrect**
   - Ensure coordinate order is [lat, lng] not [lng, lat]
   - OSRM returns [lng, lat], convert to [lat, lng]
   - Check coordinate conversion in code

## Performance Optimization

### Client-Side
```typescript
// Debounce route calculation
const debouncedCalculateRoute = useCallback(
  debounce((from, to) => calculateRoute(from, to), 500),
  []
);
```

### Server-Side Caching
```typescript
// Store calculated routes
interface CachedRoute {
  fromPlaceId: string;
  toPlaceId: string;
  polyline: string;
  distance: number;
  duration: number;
  cachedAt: Date;
}
```

## Future Enhancements

1. **Multiple waypoints** support for multi-stop deliveries
2. **Alternative routes** display with comparison
3. **Real-time traffic** integration
4. **Route preferences** (avoid tolls, highways)
5. **Elevation profile** for bicycle deliveries
6. **ETA updates** based on real-time conditions

## Related Files

- `pickom-client/components/DualLocationPicker.tsx` - Main route display component
- `pickom-client/components/LocationPicker.tsx` - Single location picker
- `pickom-client/app/delivery-methods/page.tsx` - Uses DualLocationPicker
- `pickom-server/src/delivery/entities/delivery.entity.ts` - Location data structure

## External Resources

### OSRM (Current Implementation)
- [OSRM API Documentation](http://project-osrm.org/docs/v5.24.0/api/)
- [OSRM Demo](https://map.project-osrm.org/)
- [OSRM GitHub Repository](https://github.com/Project-OSRM/osrm-backend)
- [Self-Hosting OSRM Guide](https://github.com/Project-OSRM/osrm-backend/wiki/Running-OSRM)

### Leaflet & OpenStreetMap
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)

### Google Maps (Alternative)
- [Google Maps Directions API Documentation](https://developers.google.com/maps/documentation/javascript/directions)
- [Travel Modes Reference](https://developers.google.com/maps/documentation/javascript/directions#TravelModes)
- [Polyline Encoding](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## Implementation Summary

**What Changed:**
1. ✅ Added OSRM route calculation to DualLocationPicker
2. ✅ Route follows actual roads instead of straight line
3. ✅ Display distance and duration information
4. ✅ Visual route polyline on map
5. ✅ Automatic fallback to straight line on error
6. ✅ Loading indicator during route calculation
7. ✅ **City restriction** - both markers must be in the same city

**How to Use:**
```typescript
<DualLocationPicker
  onFromLocationSelect={(location) => setFrom(location)}
  onToLocationSelect={(location) => setTo(location)}
  onRouteCalculated={(routeInfo) => {
    console.log('Distance:', routeInfo.distance);
    console.log('Duration:', routeInfo.duration);
  }}
/>
```

**Benefits:**
- 🆓 Free and unlimited
- 🚀 Fast route calculation
- 🗺️ Accurate road-based routes
- 📊 Distance and duration data
- 🔒 No API keys needed
- 🏙️ City restriction for within-city deliveries

## City Restriction Feature

### How It Works

When you select the first location (FROM), the city is automatically detected and set as a restriction:

1. **First marker placed** → City detected (e.g., "Warsaw")
2. **City restriction activated** → Blue chip displayed: "Restricted to: Warsaw"
3. **Second marker attempted in different city** → ❌ Error shown: "You can only select locations within Warsaw. Selected location is in Krakow."
4. **Second marker placed in same city** → ✅ Route calculated

### Visual Feedback

```typescript
// Blue info chip shown when restriction is active
<Chip
  label="Restricted to: Warsaw"
  color="info"
  onDelete={() => resetRestriction()}
/>

// Error alert when wrong city selected
<Alert severity="error">
  You can only select locations within Warsaw. Selected location is in Krakow.
</Alert>
```

### Resetting Restriction

Click the ❌ button on the city restriction chip to:
- Clear city restriction
- Remove both markers
- Clear route
- Start fresh

### Implementation Details

```typescript
// State for city restriction
const [cityRestriction, setCityRestriction] = useState<string | null>(null);

// Validate city on marker placement
if (cityRestriction && city && city !== cityRestriction) {
  setError(`You can only select locations within ${cityRestriction}`);
  return; // Prevent marker placement
}

// Set restriction on first marker
if (activeMarker === 'from' && city) {
  setCityRestriction(city);
}
```

### Use Cases

**Within-City Deliveries:**
- Ensures both pickup and delivery are in the same city
- Prevents cross-city delivery mistakes
- Improves user experience with clear feedback

**Inter-City Deliveries:**
- Disable or modify this feature for inter-city routes
- Can be toggled based on delivery type selection

---

**Last Updated:** 2025-10-17
**Author:** Claude Code
**Version:** 2.1 (Added City Restriction)
