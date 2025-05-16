import React from 'react';
import { NearbyVenuesScreen } from './NearbyVenueScreen';
import withErrorHandling from '../../utils/ErrorHandlerHOC';
import { useAppSelector, useAppDispatch } from 'core/src/store';
import { fetchNearbyVenues } from 'core/src/store/slices/venuesSlice';
import { useGeolocation } from 'core/src/hooks/useGeolocation';

/**
 * Container component for NearbyVenuesScreen
 * - Connects to Redux store
 * - Handles error states and loading
 * - Wraps the screen component with error handling HOC
 */
const NearbyVenuesContainer = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { coordinates } = useGeolocation();

  // Select state from Redux
  const nearbyVenues = useAppSelector(state => state.venues?.nearby?.venues || []);
  const nearbyLoading = useAppSelector(state => state.venues?.nearby?.loading);
  const nearbyError = useAppSelector(state => state.venues?.nearby?.error);

  // Handle retry
  const handleRetry = () => {
    if (coordinates) {
      dispatch(fetchNearbyVenues({ coordinates }));
    }
  };

  // Wrap the screen component with error handling
  const EnhancedNearbyVenuesScreen = withErrorHandling(NearbyVenuesScreen);

  return (
    <EnhancedNearbyVenuesScreen
      navigation={navigation}
      isLoading={nearbyLoading && nearbyVenues.length === 0}
      error={nearbyError && nearbyVenues.length === 0 ? nearbyError : null}
      onRetry={handleRetry}
      data={{
        venues: nearbyVenues,
        coordinates,
      }}
    />
  );
};

export default NearbyVenuesContainer;
