// packages/core/src/__tests__/api/foursquare.test.ts
import { foursquareService } from '../api/foursquare'; // Adjust based on actual exports

describe('Foursquare API', () => {
  it('fetches venues successfully', async () => {
    const venues = await foursquareService.fetchVenues({ latitude: 37.7749, longitude: -122.4194 });
    expect(venues).toBeDefined();
    expect(Array.isArray(venues)).toBe(true);
  });
});
