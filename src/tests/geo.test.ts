/**
 * Geospatial Utilities Tests
 */

import { haversineDistance, findNearbyIncidents, clusterIncidents } from '../../src/lib/geo';

describe('Geospatial Utilities', () => {
  describe('haversineDistance', () => {
    it('should calculate distance between two points', () => {
      // London to Paris: approximately 343 km
      const london = { latitude: 51.5074, longitude: -0.1278 };
      const paris = { latitude: 48.8566, longitude: 2.3522 };

      const distance = haversineDistance(london, paris);

      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(350);
    });

    it('should return 0 for same point', () => {
      const point = { latitude: 51.5074, longitude: -0.1278 };
      const distance = haversineDistance(point, point);

      expect(distance).toBe(0);
    });
  });

  describe('findNearbyIncidents', () => {
    it('should find incidents within radius', () => {
      const center = { latitude: 51.5074, longitude: -0.1278 };
      const incidents = [
        {
          id: '1',
          latitude: 51.5074,
          longitude: -0.1278,
        }, // Same location
        {
          id: '2',
          latitude: 51.6074,
          longitude: -0.1278,
        }, // ~10 km away
        {
          id: '3',
          latitude: 52.0074,
          longitude: -0.1278,
        }, // ~55 km away
      ];

      const nearby = findNearbyIncidents(center, 20, incidents as any);

      expect(nearby).toHaveLength(2);
      expect(nearby.map((i) => i.id)).toContain('1');
      expect(nearby.map((i) => i.id)).toContain('2');
    });
  });

  describe('clusterIncidents', () => {
    it('should cluster nearby incidents', () => {
      const incidents = [
        {
          id: '1',
          latitude: 51.5,
          longitude: -0.1,
        },
        {
          id: '2',
          latitude: 51.505,
          longitude: -0.105,
        },
        {
          id: '3',
          latitude: 52.0,
          longitude: 0.5,
        },
      ];

      const clusters = clusterIncidents(incidents as any, 2);

      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].incidents.length).toBeGreaterThan(0);
    });
  });
});
