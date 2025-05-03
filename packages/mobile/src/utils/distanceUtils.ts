/**
 * Utility functions for calculating and formatting distances
 */

/**
 * Convert degrees to radians
 */
const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = degreesToRadians(lat1);
  const φ2 = degreesToRadians(lat2);
  const Δφ = degreesToRadians(lat2 - lat1);
  const Δλ = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
};

/**
 * Format distance in a user-friendly way
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Formatted distance string (e.g., "125 m" or "2.4 km")
 */
export const getDistanceString = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string => {
  const distance = getDistance(lat1, lon1, lat2, lon2);

  // Format distance
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
};

/**
 * Get approximate walking time between two points
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Walking time in minutes
 */
export const getWalkingTime = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const distance = getDistance(lat1, lon1, lat2, lon2);
  // Average walking speed is about 5 km/h = 83.33 m/min
  const walkingSpeedMeterPerMin = 83.33;
  
  return Math.round(distance / walkingSpeedMeterPerMin);
};

/**
 * Get formatted walking time string
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Formatted walking time string (e.g., "5 min walk")
 */
export const getWalkingTimeString = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string => {
  const walkingTime = getWalkingTime(lat1, lon1, lat2, lon2);
  
  return `${walkingTime} min walk`;
};
