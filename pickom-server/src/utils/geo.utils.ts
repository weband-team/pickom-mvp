/**
 * Geo utilities for distance calculations
 */

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get search radius by delivery type
 * @param deliveryType Type of delivery
 * @returns Radius in kilometers
 */
export function getRadiusByDeliveryType(
  deliveryType: 'within-city' | 'suburban' | 'inter-city',
): number {
  switch (deliveryType) {
    case 'within-city':
      return 10; // 10 km for city delivery
    case 'suburban':
      return 25; // 25 km for suburban
    case 'inter-city':
      return 50; // 50 km for intercity
    default:
      return 10; // Default to city radius
  }
}

/**
 * Estimate delivery time based on distance
 * @param distanceKm Distance in kilometers
 * @param vehicleType Type of vehicle (optional)
 * @returns Estimated time in minutes
 */
export function estimateDeliveryTime(
  distanceKm: number,
  vehicleType?: 'car' | 'bike' | 'scooter' | 'walking',
): number {
  // Average speeds in km/h
  const speeds: Record<string, number> = {
    car: 30, // City driving with traffic
    bike: 15,
    scooter: 20,
    walking: 5,
  };

  const speed = speeds[vehicleType || 'car'];
  const timeHours = distanceKm / speed;

  return Math.round(timeHours * 60); // Convert to minutes
}
