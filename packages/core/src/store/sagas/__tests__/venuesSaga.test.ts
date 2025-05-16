import { runSaga } from 'redux-saga';
import { handleFetchRecommendedVenues } from '../../sagas/venuesSaga';
import { foursquareService } from '../../api/foursquare';
import { Venue, VenueSearchResponse } from '../../models/venue';
import { PayloadAction } from '@reduxjs/toolkit';

// Mock the entire venuesSlice module
jest.mock('../../slices/venuesSlice', () => ({
  fetchRecommendedVenues: jest.fn(),
  fetchRecommendedVenuesSuccess: jest.fn(venues => ({
    type: 'venues/fetchRecommendedVenuesSuccess',
    payload: venues,
  })),
  fetchRecommendedVenuesFailure: jest.fn(),
}));

// Import after mocking to get the mocked versions
import { fetchRecommendedVenuesSuccess } from '../slices/venuesSlice';

// --- Mocking Setup ---
// Define mock data locally or import from a dedicated mock file
const mockCoordinates = { latitude: 37.7749, longitude: -122.4194 };

// Fixed the array initialization
const mockVenuesArray: Venue[] = [
  // Example mock venue data structure based on foursquare.ts mapV2VenueToV3Venue
  {
    id: 'venue1',
    name: 'Mock Coffee Shop',
    location: { lat: 37.77, lng: -122.41 },
    categories: [],
    contact: {},
    verified: false,
  },
  {
    id: 'venue2',
    name: 'Mock Cafe',
    location: { lat: 37.78, lng: -122.42 },
    categories: [],
    contact: {},
    verified: false,
  },
];

// Fix the mockApiResponse to match VenueSearchResponse type
const mockApiResponse: VenueSearchResponse = {
  results: mockVenuesArray,
  context: {
    geoBounds: {
      circle: {
        center: {
          latitude: mockCoordinates.latitude,
          longitude: mockCoordinates.longitude,
        },
        radius: 1000,
      },
    },
  },
  totalResults: mockVenuesArray.length,
};

// Mock the API service method
jest.mock('../../../api/foursquare', () => ({
  foursquareService: {
    getRecommendedVenues: jest.fn(),
  },
}));

describe('venuesSaga', () => {
  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle fetchRecommendedVenues and dispatch success action', async () => {
    // Setup mock
    const mockApiSpy = jest
      .spyOn(foursquareService, 'getRecommendedVenues')
      .mockResolvedValue(mockApiResponse);

    const dispatched: any[] = [];

    // Create action with coordinates only - use a simple action object
    const action = {
      type: 'venues/fetchRecommendedVenues',
      payload: { coordinates: mockCoordinates },
    };

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
        getState: () => ({}), // Provide mock state if needed by the saga
      },
      handleFetchRecommendedVenues, // Run the correct handler
      action
    ).toPromise();

    // Check if the API was called correctly
    expect(mockApiSpy).toHaveBeenCalledWith(mockCoordinates, 10); // 10 is the default limit

    // Check if the correct success action was dispatched with the results array
    expect(dispatched).toContainEqual(fetchRecommendedVenuesSuccess(mockVenuesArray));

    mockApiSpy.mockRestore(); // Clean up the spy
  });
});
