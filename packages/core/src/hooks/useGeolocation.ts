import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '../store';
import { getUserLocation, setLocationPermission, setUserLocation } from '../store/slices/venuesSlice';
import { Coordinates } from '../models/venue';

interface GeolocationHook {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  requestLocation: () => void;
}

/**
 * Custom hook for getting and tracking user location using Expo Location
 */
export const useGeolocation = (): GeolocationHook => {
  const dispatch = useAppDispatch();
  const coordinates = useAppSelector(state => state.venues.userLocation);
  const permissionGranted = useAppSelector(state => state.venues.locationPermissionGranted);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Request location permissions and get location
  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      // Update permission status in Redux
      dispatch(setLocationPermission(status === 'granted'));
      
      if (status !== 'granted') {
        setError('Location permission not granted');
        setLoading(false);
        return;
      }
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      // Update location in Redux
      const newCoordinates: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      dispatch(setUserLocation(newCoordinates));
      
      // Also dispatch the getUserLocation action to trigger any sagas listening for it
      dispatch(getUserLocation());
      
    } catch (error) {
      console.error('Error getting location:', error);
      setError(error.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Check for location permissions on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        dispatch(setLocationPermission(status === 'granted'));
        
        if (status === 'granted' && !coordinates) {
          requestLocation();
        }
      } catch (err) {
        console.error('Error checking location permission:', err);
      }
    };
    
    checkPermission();
  }, [dispatch, requestLocation, coordinates]);

  return {
    coordinates,
    loading,
    error,
    permissionGranted,
    requestLocation,
  };
};
