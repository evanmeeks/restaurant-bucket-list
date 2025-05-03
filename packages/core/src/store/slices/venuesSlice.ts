import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VenuesState, Venue, Coordinates } from '../../models/app-state';

const initialState: VenuesState = {
  nearby: {
    venues: [],
    loading: false,
    error: null,
  },
  recommended: {
    venues: [],
    loading: false,
    error: null,
  },
  search: {
    venues: [],
    query: '',
    loading: false,
    error: null,
  },
  selectedVenue: null,
  userLocation: null,
  locationPermissionGranted: false,
};

const venuesSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    // User location actions
    getUserLocation: (state) => {
      // This is a saga trigger, no state change
    },
    setUserLocation: (state, action: PayloadAction<Coordinates>) => {
      state.userLocation = action.payload;
    },
    setLocationPermission: (state, action: PayloadAction<boolean>) => {
      state.locationPermissionGranted = action.payload;
    },
    locationError: (state, action: PayloadAction<string>) => {
      state.userLocation = null;
      // Not setting an error state here as we handle this at the UI level
    },
    
    // Nearby venues actions
    fetchNearbyVenues: (state, action: PayloadAction<{
      coordinates: Coordinates;
      radius?: number;
      categories?: string[];
    }>) => {
      state.nearby.loading = true;
      state.nearby.error = null;
    },
    fetchNearbyVenuesSuccess: (state, action: PayloadAction<Venue[]>) => {
      state.nearby.venues = action.payload;
      state.nearby.loading = false;
    },
    fetchNearbyVenuesFailure: (state, action: PayloadAction<string>) => {
      state.nearby.loading = false;
      state.nearby.error = action.payload;
    },
    
    // Recommended venues actions
    fetchRecommendedVenues: (state, action: PayloadAction<{
      coordinates: Coordinates;
      limit?: number;
    }>) => {
      state.recommended.loading = true;
      state.recommended.error = null;
    },
    fetchRecommendedVenuesSuccess: (state, action: PayloadAction<Venue[]>) => {
      state.recommended.venues = action.payload;
      state.recommended.loading = false;
    },
    fetchRecommendedVenuesFailure: (state, action: PayloadAction<string>) => {
      state.recommended.loading = false;
      state.recommended.error = action.payload;
    },
    
    // Search venues actions
    searchVenues: (state, action: PayloadAction<{
      coordinates: Coordinates;
      query: string;
      categories?: string[];
      radius?: number;
    }>) => {
      state.search.loading = true;
      state.search.error = null;
      state.search.query = action.payload.query;
    },
    searchVenuesSuccess: (state, action: PayloadAction<Venue[]>) => {
      state.search.venues = action.payload;
      state.search.loading = false;
    },
    searchVenuesFailure: (state, action: PayloadAction<string>) => {
      state.search.loading = false;
      state.search.error = action.payload;
    },
    
    // Selected venue actions
    selectVenue: (state, action: PayloadAction<string>) => {
      // This triggers a saga to fetch venue details
    },
    setSelectedVenue: (state, action: PayloadAction<Venue>) => {
      state.selectedVenue = action.payload;
    },
    clearSelectedVenue: (state) => {
      state.selectedVenue = null;
    },
    
    // Clear actions
    clearVenues: (state) => {
      state.nearby.venues = [];
      state.recommended.venues = [];
      state.search.venues = [];
      state.selectedVenue = null;
    },
  },
});

// Export actions
export const {
  getUserLocation,
  setUserLocation,
  setLocationPermission,
  locationError,
  fetchNearbyVenues,
  fetchNearbyVenuesSuccess,
  fetchNearbyVenuesFailure,
  fetchRecommendedVenues,
  fetchRecommendedVenuesSuccess,
  fetchRecommendedVenuesFailure,
  searchVenues,
  searchVenuesSuccess,
  searchVenuesFailure,
  selectVenue,
  setSelectedVenue,
  clearSelectedVenue,
  clearVenues,
} = venuesSlice.actions;

// Export reducer
export default venuesSlice.reducer;
