import { runSaga } from 'redux-saga';
import { handleFetchRecommendedVenues } from '../venuesSaga.updated';
import { foursquareServiceV3 } from '../../../api/foursquareV3';
import { 
  mockRecommendedVenuesSuccess,
  mockFoursquareError
} from '../../../../mocks/utils';
import recommendedVenuesResponse from '../../../../mocks/fixtures/recommendedVenuesResponse.json';
import FoursquareAdapter from '../../../api/adapters/foursquareAdapter';

// Mock the venuesSlice module
jest.mock('../../slices/venuesSlice', () => ({
  fetchRecommendedVenues: jest.fn(),
  fetchRecommendedVenuesSuccess: jest.fn((venues) => ({
    type: 'venues/fetchRecommendedVenuesSuccess',
    payload: venues
  })),
  fetchRecommendedVenuesFailure: jest.fn((error) => ({
    type: 'venues/fetchRecommendedVenuesFailure',
    payload: error
  }))
}));

// Import after mocking
import { 
  fetchRecommendedVenuesSuccess,
  fetchRecommendedVenuesFailure 
} from '../../slices/venuesSlice';

describe('venuesSaga with MSW', () => {
  // Test coordinates
  const mockCoordinates = { 
    latitude: 41.8781, 
    longitude: -87.6298 
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch recommended venues and dispatch success action', async () => {
    // Setup MSW to intercept the API request
    mockRecommendedVenuesSuccess();

    // Create action
    const action = {
      type: 'venues/fetchRecommendedVenues',
      payload: { coordinates: mockCoordinates }
    };

    // Setup for dispatched actions
    const dispatched = [];
    
    // Run the saga
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      handleFetchRecommendedVenues,
      action
    ).toPromise();

    // Convert the API response to match our app's model for verification
    const expectedVenues = FoursquareAdapter.mapSearchResponse(recommendedVenuesResponse).results;

    // Verify API was called with correct parameters
    expect(dispatched).toHaveLength(1);
    
    // Verify correct action was dispatched
    expect(dispatched[0].type).toBe(fetchRecommendedVenuesSuccess().type);
    expect(dispatched[0].payload).toHaveLength(expectedVenues.length);
    
    // Verify specific data in the dispatched payload
    const firstVenue = dispatched[0].payload[0];
    expect(firstVenue.id).toBe(recommendedVenuesResponse.results[0].fsq_id);
    expect(firstVenue.name).toBe(recommendedVenuesResponse.results[0].name);
  });

  it('should handle API errors and dispatch failure action', async () => {
    // Setup MSW to return an error
    mockFoursquareError(500, 'Internal server error');

    // Setup dispatched actions array
    const dispatched = [];
    
    // Create action
    const action = {
      type: 'venues/fetchRecommendedVenues',
      payload: { coordinates: mockCoordinates }
    };

    // Run the saga
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      handleFetchRecommendedVenues,
      action
    ).toPromise();

    // Verify failure action was dispatched
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe(fetchRecommendedVenuesFailure().type);
    expect(dispatched[0].payload).toBeDefined();
  });

  it('should pass the limit parameter to the API when specified', async () => {
    // Setup spy on service method
    const serviceSpy = jest.spyOn(foursquareServiceV3, 'getRecommendedVenues');
    
    // Setup MSW to intercept the API request
    mockRecommendedVenuesSuccess();

    // Create action with custom limit
    const customLimit = 5;
    const action = {
      type: 'venues/fetchRecommendedVenues',
      payload: { 
        coordinates: mockCoordinates,
        limit: customLimit
      }
    };

    // Setup for dispatched actions
    const dispatched = [];
    
    // Run the saga
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      handleFetchRecommendedVenues,
      action
    ).toPromise();

    // Verify service was called with correct limit
    expect(serviceSpy).toHaveBeenCalledWith(mockCoordinates, customLimit);
    
    // Cleanup
    serviceSpy.mockRestore();
  });
});
