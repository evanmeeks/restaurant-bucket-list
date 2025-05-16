import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coordinates, Venue } from '../../models/venue';

interface NearbyVenuesState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}

interface RecommendedVenuesState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}

interface SearchVenuesState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}

interface FoursquareDataState {
  rawJson: string | null; // Store raw JSON response
  loading: boolean;
  error: string | null;
}

interface VenuesState {
  userLocation: Coordinates | null;
  locationPermissionGranted: boolean;
  nearby: NearbyVenuesState;
  recommended: RecommendedVenuesState;
  search: SearchVenuesState;
  selectedVenue: Venue | null;
  foursquareData: FoursquareDataState;
}

const initialState: VenuesState = {
  userLocation: null,
  locationPermissionGranted: false,
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
    loading: false,
    error: null,
  },
  selectedVenue: null,
  foursquareData: {
    rawJson: null,
    loading: false,
    error: null,
  },
};

const venuesSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    getUserLocation(state) {
      state.nearby.loading = true;
      state.nearby.error = null;
    },
    setUserLocation(state, action: PayloadAction<Coordinates>) {
      state.userLocation = action.payload;
      state.nearby.loading = false;
    },
    setLocationPermission(state, action: PayloadAction<boolean>) {
      state.locationPermissionGranted = action.payload;
    },
    // Change this reducer name to match the exported action name
    fetchNearbyVenues(state, _action: PayloadAction<{ coordinates: Coordinates; radius?: number; categories?: string[] }>) {
      state.nearby.loading = true;
      state.nearby.error = null;
    },
    fetchNearbyVenuesSuccess(state, action: PayloadAction<Venue[]>) {
      console.log(
        `%c action.payload fetchNearbyVenuesSuccess ` + JSON.stringify(action.payload, null, 4),
        'color:white; background:green; font-size: 20px'
      );
      state.nearby.venues = action.payload;
      state.nearby.loading = false;
      state.nearby.error = null;
    },
    fetchNearbyVenuesFailure(state, action: PayloadAction<string>) {
      state.nearby.loading = false;
      state.nearby.error = action.payload;
      console.log(
        `%c action.payload fetchNearbyVenuesFailure ` + JSON.stringify(action.payload, null, 4),
        'color:white; background:green; font-size: 20px'
      );
    },
    fetchRecommendedVenues(state, _action: PayloadAction<{ coordinates: Coordinates; limit?: number }>) {
      state.recommended.loading = true;
      state.recommended.error = null;
    },
    fetchRecommendedVenuesSuccess(state, action: PayloadAction<Venue[]>) {
      state.recommended.venues = action.payload;
      console.log(
        `%c action.payload fetchRecommendedVenuesSuccess ` +
          JSON.stringify(action.payload, null, 4),
        'color:white; background:green; font-size: 20px'
      );
      state.recommended.loading = false;
      state.recommended.error = null;
    },
    fetchRecommendedVenuesFailure(state, action: PayloadAction<string>) {
      state.recommended.loading = false;
      state.recommended.error = action.payload;
      console.log(
        `%c action.payload fetchRecommendedVenuesFailure ` +
          JSON.stringify(action.payload, null, 4),
        'color:white; background:green; font-size: 20px'
      );
    },
    // Add missing actions for search and venue selection
    searchVenues(state, _action: PayloadAction<{ coordinates: Coordinates; query: string; categories?: string[]; radius?: number }>) {
      state.search.loading = true;
      state.search.error = null;
    },
    searchVenuesSuccess(state, action: PayloadAction<Venue[]>) {
      state.search.venues = action.payload;
      state.search.loading = false;
      state.search.error = null;
    },
    searchVenuesFailure(state, action: PayloadAction<string>) {
      state.search.loading = false;
      state.search.error = action.payload;
    },
    selectVenue(state, _action: PayloadAction<string>) {
      // This is just a trigger for the saga, no state changes needed
    },
    setSelectedVenue(state, action: PayloadAction<Venue>) {
      state.selectedVenue = action.payload;
    },
    fetchFoursquareData(state, _action: PayloadAction<{ coordinates: Coordinates }>) {
      state.foursquareData.loading = true;
      state.foursquareData.error = null;
      state.foursquareData.rawJson = null;
    },
    fetchFoursquareDataSuccess(state, action: PayloadAction<string>) {
      state.foursquareData.rawJson = action.payload;
      console.log(
        `%c action.payload fetchFoursquareDataSuccess ` + JSON.stringify(action.payload, null, 4),
        'color:white; background:green; font-size: 20px'
      );
      state.foursquareData.loading = false;
      state.foursquareData.error = null;
    },
    fetchFoursquareDataFailure(state, action: PayloadAction<string>) {
      state.foursquareData.loading = false;
      console.log(
        `%c action.payload fetchFoursquareDataFailure ` + JSON.stringify(action.payload, null, 4),
        'color:white; background:green; font-size: 20px'
      );
      state.foursquareData.error = action.payload;
    },
  },
});

export const {
  getUserLocation,
  setUserLocation,
  setLocationPermission,
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
  fetchFoursquareData,
  fetchFoursquareDataSuccess,
  fetchFoursquareDataFailure,
} = venuesSlice.actions;

export default venuesSlice.reducer;
