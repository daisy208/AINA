/**
 * Geospatial Utilities
 * Provides distance calculations, proximity queries, and clustering
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in kilometers
 */
export function haversineDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLng = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Find incidents within a specified radius
 * @param center Center coordinate
 * @param radiusKm Radius in kilometers
 * @param incidents Array of incidents with coordinates
 * @returns Filtered incidents within radius
 */
export function findNearbyIncidents<T extends Coordinate>(
  center: Coordinate,
  radiusKm: number,
  incidents: (T & { latitude?: number; longitude?: number })[]
): T[] {
  return incidents.filter((incident) => {
    if (!incident.latitude || !incident.longitude) return false;
    const distance = haversineDistance(
      center,
      {
        latitude: incident.latitude,
        longitude: incident.longitude,
      }
    );
    return distance <= radiusKm;
  });
}

/**
 * Simple clustering using k-means style algorithm
 * Groups nearby incidents into hotspots
 * @param incidents Incidents with coordinates
 * @param maxClusters Maximum number of clusters
 * @returns Clustered incidents with center points
 */
export function clusterIncidents<T extends Coordinate>(
  incidents: (T & { latitude?: number; longitude?: number })[],
  maxClusters: number = 10
): { center: Coordinate; incidents: T[]; radius: number }[] {
  if (incidents.length === 0) return [];

  // Filter incidents with valid coordinates
  const validIncidents = incidents.filter(
    (i) => i.latitude != null && i.longitude != null
  );

  if (validIncidents.length === 0) return [];

  // Simple implementation: group by proximity
  const clusters: {
    center: Coordinate;
    incidents: T[];
    radius: number;
  }[] = [];

  const unclustered = [...validIncidents];

  while (unclustered.length > 0 && clusters.length < maxClusters) {
    // Pick first unclustered point as cluster center
    const seed = unclustered[0];
    const center: Coordinate = {
      latitude: seed.latitude!,
      longitude: seed.longitude!,
    };

    // Find nearby incidents (within 2km)
    const nearby = unclustered.filter((incident) => {
      const distance = haversineDistance(center, {
        latitude: incident.latitude!,
        longitude: incident.longitude!,
      });
      return distance <= 2;
    });

    // Calculate actual center of cluster
    const avgLat = nearby.reduce((sum, inc) => sum + inc.latitude!, 0) / nearby.length;
    const avgLng = nearby.reduce((sum, inc) => sum + inc.longitude!, 0) / nearby.length;

    // Calculate max distance from center
    const maxDistance = Math.max(
      ...nearby.map((inc) =>
        haversineDistance(
          { latitude: avgLat, longitude: avgLng },
          { latitude: inc.latitude!, longitude: inc.longitude! }
        )
      )
    );

    clusters.push({
      center: { latitude: avgLat, longitude: avgLng },
      incidents: nearby as T[],
      radius: maxDistance,
    });

    // Remove clustered incidents
    for (const incident of nearby) {
      const idx = unclustered.indexOf(incident);
      if (idx > -1) unclustered.splice(idx, 1);
    }
  }

  return clusters;
}

/**
 * Get bounding box for a coordinate with radius
 * Useful for geographic queries
 */
export function getBoundingBox(
  center: Coordinate,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latChange = (radiusKm / 111.32) * 1.1; // 1 degree lat ≈ 111.32 km, add 10% buffer
  const lngChange = (radiusKm / (111.32 * Math.cos(toRad(center.latitude)))) * 1.1;

  return {
    minLat: center.latitude - latChange,
    maxLat: center.latitude + latChange,
    minLng: center.longitude - lngChange,
    maxLng: center.longitude + lngChange,
  };
}
