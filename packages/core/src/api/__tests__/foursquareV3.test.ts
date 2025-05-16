import { foursquareV3Service } from '../foursquareV3';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Coordinates for Austin, TX
const AUSTIN_COORDINATES = {
  latitude: 30.2672,
  longitude: -97.7431,
};

describe('FoursquareV3Service', () => {
  // Set up the MSW server before all tests
  beforeAll(() => server.listen());
  
  // Reset any request handlers between tests
  afterEach(() => server.resetHandlers());
  
  // Clean up after all tests
  afterAll(() => server.close());

  describe('getRecommendedVenues', () => {
    it('should fetch recommended venues successfully', async () => {
      // Call the service method - will use the fixture data
      const result = await foursquareV3Service.getRecommendedVenues(AUSTIN_COORDINATES);

      // Assert the result
      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      
      // Check some properties we know should be in the fixture
      const firstVenue = result.results[0];
      expect(firstVenue.fsq_id).toBeDefined();
      expect(firstVenue.name).toBeDefined();
      expect(firstVenue.categories).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Override the handler to simulate an error
      server.use(
        http.get('https://api.foursquare.com/v3/places/search', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      // Call the service method and expect it to throw
      await expect(foursquareV3Service.getRecommendedVenues(AUSTIN_COORDINATES))
        .rejects.toThrow();
    });
  });

  describe('getVenueDetails', () => {
    it('should fetch venue details for Franklin Barbecue successfully', async () => {
      const venueId = '4df44456d1add5a8baa15599'; // Franklin Barbecue
      
      // Call the service method - will use the fixture data
      const result = await foursquareV3Service.getVenueDetails(venueId);

      // Assert the result
      expect(result).toBeDefined();
      expect(result.fsq_id).toBe(venueId);
      expect(result.name).toBe('Franklin Barbecue');
      expect(result.categories).toBeDefined();
      expect(result.location).toBeDefined();
    });

    it('should handle non-existent venue IDs', async () => {
      const venueId = 'non-existent-venue-id';
      
      // Call the service method - will use the fallback mock data
      const result = await foursquareV3Service.getVenueDetails(venueId);

      // Assert the result still contains the expected structure
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.categories).toBeDefined();
    });

    it('should handle errors in venue details', async () => {
      // Override the handler to simulate an error
      server.use(
        http.get('https://api.foursquare.com/v3/places/:venueId', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      // Call the service method and expect it to throw
      await expect(foursquareV3Service.getVenueDetails('any-id'))
        .rejects.toThrow();
    });
  });

  describe('searchNearbyVenues', () => {
    it('should search for restaurants near Austin', async () => {
      // Call the service method - will use the fixture data
      const result = await foursquareV3Service.searchNearbyVenues(
        AUSTIN_COORDINATES,
        'restaurant'
      );

      // Assert the result
      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      
      // Check that at least one result is a restaurant
      const hasRestaurants = result.results.some(venue => 
        venue.categories && 
        venue.categories.some(category => 
          category.name.includes('Restaurant')
        )
      );
      
      expect(hasRestaurants).toBe(true);
    });

    it('should search for coffee shops near Austin', async () => {
      // Call the service method - will use the fixture data
      const result = await foursquareV3Service.searchNearbyVenues(
        AUSTIN_COORDINATES,
        'coffee'
      );

      // Assert the result
      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      
      // Check that at least one result is a coffee shop
      const hasCoffeeShops = result.results.some(venue => 
        venue.categories && 
        venue.categories.some(category => 
          category.name.includes('Coffee')
        )
      );
      
      expect(hasCoffeeShops).toBe(true);
    });

    it('should correctly pass parameters to the API', async () => {
      // Override the handler to verify parameter passing
      server.use(
        http.get('https://api.foursquare.com/v3/places/search', ({ request }) => {
          const url = new URL(request.url);
          
          // Check that the parameters are correctly passed
          expect(url.searchParams.get('ll')).toBe(`${AUSTIN_COORDINATES.latitude},${AUSTIN_COORDINATES.longitude}`);
          expect(url.searchParams.get('query')).toBe('burger');
          expect(url.searchParams.get('radius')).toBe('750');
          expect(url.searchParams.get('limit')).toBe('15');
          
          return HttpResponse.json({
            results: [
              {
                fsq_id: 'test-id',
                name: 'Test Burger Place',
                categories: [{ id: 13000, name: 'Burger Restaurant' }],
              },
            ],
          });
        })
      );

      // Call the service method with specific parameters
      const result = await foursquareV3Service.searchNearbyVenues(
        AUSTIN_COORDINATES,
        'burger',
        undefined,
        750,
        15
      );

      // Assert the result
      expect(result).toBeDefined();
      expect(result.results).toHaveLength(1);
      expect(result.results[0].name).toBe('Test Burger Place');
    });
  });
});
