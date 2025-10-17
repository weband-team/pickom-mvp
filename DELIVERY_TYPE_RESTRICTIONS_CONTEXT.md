# Delivery Type Restrictions Context

## Overview
This document provides context for implementing location restrictions based on delivery type in the Pickom application. Different delivery types have different geographical constraints to ensure deliveries are logistically feasible.

## Delivery Types

### 1. Within-City Delivery
**Use Case:** Same-day deliveries within a single city

**Location Restrictions:**
- ✅ Both pickup and delivery must be in the **same city**
- ❌ Cannot select locations in different cities
- 🎯 Ideal for: Documents, food, small packages

**Example:**
```
✅ VALID:
FROM: ul. Marszałkowska 1, Warsaw
TO: ul. Nowy Świat 10, Warsaw

❌ INVALID:
FROM: ul. Marszałkowska 1, Warsaw
TO: ul. Piotrkowska 5, Lodz  // Different city!
```

**Implementation:**
- Restriction level: **City**
- Validation field: `location.city`
- Error message: "You can only select locations within {cityName}"

---

### 2. Inter-City Delivery
**Use Case:** Deliveries between different cities within the same country

**Location Restrictions:**
- ✅ Both pickup and delivery must be in the **same country**
- ✅ Can be in different cities
- ❌ Cannot select locations in different countries
- 🎯 Ideal for: Larger packages, furniture, scheduled deliveries

**Example:**
```
✅ VALID:
FROM: ul. Marszałkowska 1, Warsaw, Poland
TO: ul. Piotrkowska 5, Lodz, Poland  // Different city, same country

❌ INVALID:
FROM: ul. Marszałkowska 1, Warsaw, Poland
TO: Unter den Linden 1, Berlin, Germany  // Different country!
```

**Implementation:**
- Restriction level: **Country**
- Validation field: `location.country`
- Error message: "You can only select locations within {countryName}"

---

### 3. International Delivery
**Use Case:** Cross-border deliveries between countries

**Location Restrictions:**
- ✅ No geographical restrictions
- ✅ Can select any two locations worldwide
- 🎯 Ideal for: International shipping, cross-border commerce

**Example:**
```
✅ VALID:
FROM: Warsaw, Poland
TO: Berlin, Germany

✅ ALSO VALID:
FROM: New York, USA
TO: Tokyo, Japan
```

**Implementation:**
- Restriction level: **None**
- No validation needed
- Free location selection

---

## Data Structure

### Location Interface (Enhanced)
```typescript
interface LocationData {
  lat: number;        // Latitude
  lng: number;        // Longitude
  address: string;    // Full formatted address
  city?: string;      // City name (for within-city validation)
  country?: string;   // Country name (for inter-city validation)
  placeId?: string;   // Optional Google Places ID
}
```

### Nominatim Response Mapping
```typescript
// Nominatim returns address components
const nominatimResponse = {
  address: {
    city: "Warsaw",           // or town, village
    country: "Poland",
    country_code: "pl",
    state: "Masovian Voivodeship"
  }
};

// Extract for our LocationData
const locationData = {
  city: data.address?.city || data.address?.town || data.address?.village,
  country: data.address?.country
};
```

---

## Component Props

### DualLocationPicker Props (Enhanced)
```typescript
interface Props {
  onFromLocationSelect: (location: LocationData) => void;
  onToLocationSelect: (location: LocationData) => void;
  initialFromLocation?: LocationData;
  initialToLocation?: LocationData;
  onRouteCalculated?: (routeInfo: RouteInfo) => void;

  // NEW: Delivery type for restrictions
  deliveryType?: 'within-city' | 'inter-city' | 'international';
}
```

### Default Behavior
```typescript
// If no deliveryType specified, no restrictions applied
deliveryType = undefined  → No restrictions
deliveryType = 'within-city'  → City restriction
deliveryType = 'inter-city'   → Country restriction
deliveryType = 'international' → No restrictions
```

---

## Implementation Strategy

### State Management
```typescript
// Current restriction state
const [restrictionType, setRestrictionType] = useState<'city' | 'country' | null>(null);
const [restrictionValue, setRestrictionValue] = useState<string | null>(null);

// Set restriction based on delivery type
useEffect(() => {
  if (deliveryType === 'within-city') {
    setRestrictionType('city');
  } else if (deliveryType === 'inter-city') {
    setRestrictionType('country');
  } else {
    setRestrictionType(null);
  }
}, [deliveryType]);
```

### Validation Logic
```typescript
const validateLocation = (location: LocationData): boolean => {
  if (!restrictionType || !restrictionValue) {
    return true; // No restrictions
  }

  if (restrictionType === 'city') {
    if (location.city !== restrictionValue) {
      setError(`You can only select locations within ${restrictionValue}`);
      return false;
    }
  }

  if (restrictionType === 'country') {
    if (location.country !== restrictionValue) {
      setError(`You can only select locations within ${restrictionValue}`);
      return false;
    }
  }

  return true;
};
```

### First Location Selection
```typescript
const handleFirstLocation = (location: LocationData) => {
  setFromLocation(location);

  // Set restriction based on delivery type
  if (deliveryType === 'within-city' && location.city) {
    setRestrictionValue(location.city);
  } else if (deliveryType === 'inter-city' && location.country) {
    setRestrictionValue(location.country);
  }
};
```

---

## Visual Feedback

### Restriction Chip Display
```typescript
// Within-City
<Chip
  label="Restricted to: Warsaw"
  color="success"
  icon={<LocationCity />}
/>

// Inter-City
<Chip
  label="Restricted to: Poland"
  color="primary"
  icon={<Flag />}
/>

// International (No restriction)
// No chip displayed
```

### Error Messages
```typescript
// Within-City Error
"You can only select locations within Warsaw. Selected location is in Lodz."

// Inter-City Error
"You can only select locations within Poland. Selected location is in Germany."

// Color coding
Within-City error: Orange/Warning
Inter-City error: Orange/Warning
```

---

## Parent Component Integration

### delivery-methods/page.tsx Usage
```typescript
// State for selected delivery method
const [selectedMethod, setSelectedMethod] = useState<'within-city' | 'inter-city' | 'international'>('within-city');

// Pass to DualLocationPicker
<DualLocationPicker
  deliveryType={selectedMethod}
  onFromLocationSelect={handleFromLocation}
  onToLocationSelect={handleToLocation}
/>

// When user switches tabs/methods
const handleMethodChange = (method: DeliveryMethodType) => {
  setSelectedMethod(method);
  // Reset locations if switching between restriction types
  if (shouldResetLocations(currentMethod, method)) {
    setFromLocation(null);
    setToLocation(null);
  }
};
```

### Auto-Reset on Method Change
```typescript
// Reset locations when switching between restriction types
const shouldResetLocations = (oldType, newType) => {
  // Within-city ↔ Inter-city: Reset (different restrictions)
  if ((oldType === 'within-city' && newType === 'inter-city') ||
      (oldType === 'inter-city' && newType === 'within-city')) {
    return true;
  }

  // Any type ↔ International: Keep locations (no restrictions)
  return false;
};
```

---

## Edge Cases & Handling

### 1. Location Without City/Country Data
```typescript
// If geocoding doesn't return city/country
if (deliveryType === 'within-city' && !location.city) {
  setWarning("Could not determine city. Please select a more specific location.");
}

if (deliveryType === 'inter-city' && !location.country) {
  setWarning("Could not determine country. Please select a more specific location.");
}
```

### 2. Ambiguous Location Names
```typescript
// Multiple cities with same name
"Springfield" could be in:
- Springfield, Illinois, USA
- Springfield, Massachusetts, USA
- Springfield, Missouri, USA

Solution: Use full address comparison or coordinate-based validation
```

### 3. Border Cases
```typescript
// Location near city/country border
if (distanceToBorder < 1km) {
  setInfo("This location is near the city/country border. Please verify the address.");
}
```

### 4. Initial Locations With Restrictions
```typescript
// If initialFromLocation provided with deliveryType
useEffect(() => {
  if (initialFromLocation && deliveryType) {
    if (deliveryType === 'within-city') {
      setRestrictionValue(initialFromLocation.city);
    } else if (deliveryType === 'inter-city') {
      setRestrictionValue(initialFromLocation.country);
    }
  }
}, [initialFromLocation, deliveryType]);
```

---

## Testing Scenarios

### Within-City Testing
```typescript
// Test Case 1: Same city
FROM: "Marszałkowska 1, Warsaw"
TO: "Nowy Świat 10, Warsaw"
Expected: ✅ Route calculated

// Test Case 2: Different city
FROM: "Marszałkowska 1, Warsaw"
TO: "Piotrkowska 5, Lodz"
Expected: ❌ Error shown, marker not placed

// Test Case 3: Unknown city
FROM: "Middle of forest, Poland"
Expected: ⚠️ Warning shown
```

### Inter-City Testing
```typescript
// Test Case 1: Different cities, same country
FROM: "Marszałkowska 1, Warsaw, Poland"
TO: "Piotrkowska 5, Lodz, Poland"
Expected: ✅ Route calculated

// Test Case 2: Different countries
FROM: "Marszałkowska 1, Warsaw, Poland"
TO: "Unter den Linden, Berlin, Germany"
Expected: ❌ Error shown, marker not placed

// Test Case 3: Unknown country
FROM: "Middle of ocean"
Expected: ⚠️ Warning shown
```

### International Testing
```typescript
// Test Case 1: Any locations
FROM: "Warsaw, Poland"
TO: "Berlin, Germany"
Expected: ✅ Route calculated (or straight line for long distances)

// Test Case 2: Intercontinental
FROM: "New York, USA"
TO: "Tokyo, Japan"
Expected: ✅ Markers placed (OSRM may fail, fallback to straight line)
```

---

## Performance Considerations

### Geocoding Optimization
```typescript
// Cache geocoding results
const geocodeCache = new Map<string, LocationData>();

const getCachedGeocode = async (lat: number, lng: number) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key);
  }
  const result = await getAddressFromCoordinates(lat, lng);
  geocodeCache.set(key, result);
  return result;
};
```

### Debounce Validation
```typescript
// Avoid rapid API calls during map panning
const debouncedValidation = debounce(validateLocation, 300);
```

---

## User Experience Guidelines

### Clear Communication
1. **Show current restriction** - Always display active restriction in a chip
2. **Explain errors clearly** - "You can only select locations within X"
3. **Provide reset option** - Allow easy restart with X button
4. **Visual feedback** - Different colors for different restriction types

### Progressive Disclosure
1. **First marker** - No restrictions shown yet
2. **After first marker** - Show restriction chip
3. **Invalid second marker** - Show error + keep chip
4. **Valid second marker** - Show route + keep chip

### Help Text
```typescript
// Within-City
"Both locations must be in the same city"

// Inter-City
"Both locations must be in the same country (can be different cities)"

// International
"No restrictions - select any two locations worldwide"
```

---

## Related Files

- `pickom-client/components/DualLocationPicker.tsx` - Main component
- `pickom-client/app/delivery-methods/page.tsx` - Parent component with delivery type selection
- `pickom-client/types/delivery.ts` - Type definitions
- `MAP_ROUTES_CONTEXT.md` - Route calculation context

---

## Migration Path

### Phase 1: Add deliveryType prop (Current)
- Add optional `deliveryType` prop to DualLocationPicker
- Maintain backward compatibility (no prop = no restrictions)

### Phase 2: Implement restrictions
- Within-city: City validation
- Inter-city: Country validation
- International: No validation

### Phase 3: Update parent components
- Pass deliveryType from delivery-methods page
- Handle location reset on type change

### Phase 4: Enhanced features (Future)
- Distance-based validation (e.g., max 50km for within-city)
- Region-based restrictions (e.g., EU countries only)
- Custom restriction zones

---

**Last Updated:** 2025-10-17
**Author:** Claude Code
**Version:** 1.0
**Purpose:** Context for implementing delivery type-based location restrictions
