import { foursquareService } from '../foursquare';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Coordinates for Chicago, IL
const CHICAGO_COORDINATES = {
  latitude: 41.8781,
  longitude: -87.6298,
};

describe('FoursquareService', () => {
  // Set up the MSW server before all tests
  beforeAll(() => server.listen());
  
  // Reset any request handlers between tests
  afterEach(() => server.resetHandlers());
  
  // Clean up after all tests
  afterAll(() => server.close());

  describe('getRecommendedVenues', () => {
    it('should fetch recommended venues successfully', async () => {
      // Override the handler to return a simplified response for the test
      server.use(
        http.get('https://api.foursquare.com/v3/places/search', () => {
          return HttpResponse.json({
            results: [
              {
                fsq_id: 'test-id-1',
                name: 'Test Restaurant 1',
                categories: [{ id: 1, name: 'Italian' }],
              },
              {
                fsq_id: 'test-id-2',
                name: 'Test Restaurant 2',
                categories: [{ id: 2, name: 'Mexican' }],
              },
            ],
          });
        })
      );

      // Call the service method
      const result = await foursquareService.getRecommendedVenues(CHICAGO_COORDINATES);

      // Assert the result
      expect(result).toBeDefined();
      expect(result.results).toHaveLength(2);
      expect(result.results[0].name).toBe('Test Restaurant 1');
      expect(result.results[1].name).toBe('Test Restaurant 2');
    });

    it('should handle errors gracefully', async () => {
      // Override the handler to simulate an error
      server.use(
        http.get('https://api.foursquare.com/v3/places/search', () => {
          return HttpResponse.error();
        })
      );

      // Call the service method and expect it to throw
      await expect(foursquareService.getRecommendedVenues(CHICAGO_COORDINATES))
        .rejects.toThrow();
    });
  });

  describe('getVenueDetails', () => {
    it('should fetch venue details successfully', async () => {
      const venueId = 'test-venue-id';
      
      // Override the handler to return a specific venue
      server.use(
        http.get(`https://api.foursquare.com/v3/places/${venueId}`, () => {
          return HttpResponse.json({
            fsq_id: venueId,
            name: 'Test Venue Details',
            description: 'A wonderful test venue',
            rating: 9.5,
          });
        })
      );

      // Call the service method
      const result = await foursquareService.getVenueDetails(venueId);

      // Assert the result
      expect(result).toBeDefined();
      expect(result.id).toBe(venueId);
      expect(result.name).toBe('Test Venue Details');
      expect(result.description).toBe('A wonderful test venue');
    });
  });
});
