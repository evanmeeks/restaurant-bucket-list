import { foursquareService } from '../foursquare';
import { mockNearbyVenuesSuccess, mockVenueDetailsSuccess } from '../../../mocks/utils';

describe('FoursquareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch recommended venues', async () => {
    // Setup mock response
    mockNearbyVenuesSuccess();

    const coordinates = {
      latitude: 41.8781,
      longitude: -87.6298
    };

    // Trigger the API call
    const response = await foursquareService.getRecommendedVenues(coordinates);

    // Verify response is defined
    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(response.results.length).toBeGreaterThan(0);
  });

  it('should fetch venue details', async () => {
    // Setup mock response for the venue details
    mockVenueDetailsSuccess();

    // Use a test venue ID
    const venueId = '49dce73af964a520bb5f1fe3';

    // Trigger the API call
    const response = await foursquareService.getVenueDetails(venueId);

    // Verify response is defined
    expect(response).toBeDefined();
    expect(response.id).toBeDefined();
    expect(response.name).toBeDefined();
  });
});
