import React from 'react';
import RecommendedVenuesScreen from './RecommendedVenuesScreen';
import withErrorHandling from '../../utils/ErrorHandlerHOC';
import { useAppSelector, useAppDispatch } from 'core/src/store';
import { fetchRecommendedVenues } from 'core/src/store/slices/venuesSlice';
import { useGeolocation } from 'core/src/hooks/useGeolocation';

/**
 * Container component for RecommendedVenuesScreen
 * - Connects to Redux store
 * - Handles error states and loading
 * - Wraps the screen component with error handling HOC
 */
const RecommendedVenuesContainer = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { coordinates } = useGeolocation();

  // Select state from Redux
  const recommendedVenues = useAppSelector(state => state.venues?.recommended?.venues || []);
  const recommendedLoading = useAppSelector(state => state.venues?.recommended?.loading);
  const recommendedError = useAppSelector(state => state.venues?.recommended?.error);

  // Handle retry
  const handleRetry = () => {
    if (coordinates) {
      dispatch(fetchRecommendedVenues({ coordinates }));
    }
  };

  // Wrap the screen component with error handling
  const EnhancedRecommendedVenuesScreen = withErrorHandling(RecommendedVenuesScreen);

  return (
    <EnhancedRecommendedVenuesScreen
      navigation={navigation}
      isLoading={recommendedLoading && recommendedVenues.length === 0}
      error={recommendedError && recommendedVenues.length === 0 ? recommendedError : null}
      onRetry={handleRetry}
      data={{
        venues: recommendedVenues,
        coordinates,
      }}
    />
  );
};

export default RecommendedVenuesContainer;
