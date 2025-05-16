// Mock implementation of venuesSlice for testing
import { Venue, Coordinates } from '../../../models/venue';

// Action creators
export const getUserLocation = jest.fn().mockReturnValue({ type: 'venues/getUserLocation' });
export const setLocationPermission = jest.fn().mockReturnValue({ type: 'venues/setLocationPermission' });
export const setUserLocation = jest.fn().mockReturnValue({ type: 'venues/setUserLocation' });

export const NearbyVenues = jest.fn().mockImplementation((payload) => ({
  type: 'venues/NearbyVenues',
  payload
}));

export const fetchNearbyVenuesSuccess = jest.fn().mockImplementation((venues) => ({
  type: 'venues/fetchNearbyVenuesSuccess',
  payload: venues
}));

export const fetchNearbyVenuesFailure = jest.fn().mockImplementation((error) => ({
  type: 'venues/fetchNearbyVenuesFailure',
  payload: error
}));

export const fetchRecommendedVenues = jest.fn().mockImplementation((payload) => ({
  type: 'venues/fetchRecommendedVenues',
  payload
}));

export const fetchRecommendedVenuesSuccess = jest.fn().mockImplementation((venues) => ({
  type: 'venues/fetchRecommendedVenuesSuccess',
  payload: venues
}));

export const fetchRecommendedVenuesFailure = jest.fn().mockImplementation((error) => ({
  type: 'venues/fetchRecommendedVenuesFailure',
  payload: error
}));

export const fetchFoursquareData = jest.fn().mockImplementation((payload) => ({
  type: 'venues/fetchFoursquareData',
  payload
}));

export const fetchFoursquareDataSuccess = jest.fn().mockImplementation((data) => ({
  type: 'venues/fetchFoursquareDataSuccess',
  payload: data
}));

export const fetchFoursquareDataFailure = jest.fn().mockImplementation((error) => ({
  type: 'venues/fetchFoursquareDataFailure',
  payload: error
}));

// Initial state shape (used for type checking)
export const initialState = {
  userLocation: null as Coordinates | null,
  locationPermissionGranted: false,
  nearby: {
    venues: [] as Venue[],
    loading: false,
    error: null as string | null,
  },
  recommended: {
    venues: [] as Venue[],
    loading: false,
    error: null as string | null,
  },
  foursquareData: {
    rawJson: null as string | null,
    loading: false,
    error: null as string | null,
  },
};

// For TypeScript, export a type for the state
export type VenuesState = typeof initialState;

// Mock reducer (not used in tests but helps with type checking)
export const venuesReducer = jest.fn().mockImplementation((state = initialState, action) => state);
