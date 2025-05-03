import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  getUserLocation, 
  setLocationPermission 
} from '../store/slices/venuesSlice';
import { Coordinates } from '../models/venue';

interface GeolocationHook {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  requestLocation: () => void;
}

/**
 * Custom hook for getting and tracking user location
 */
export const useGeolocation = (): GeolocationHook => {
  const dispatch = useAppDispatch();
  const coordinates = useAppSelector(state => state.venues.userLocation);
  const permissionGranted = useAppSelector(state => state.venues.locationPermissionGranted);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Request location permissions and get location
  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    dispatch(getUserLocation());
  }, [dispatch]);

  // Check for location permissions on mount
  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Check permission status if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then(result => {
          if (result.state === 'granted') {
            dispatch(setLocationPermission(true));
            requestLocation();
          } else if (result.state === 'prompt') {
            // We'll wait for user to explicitly request location
            dispatch(setLocationPermission(false));
          } else if (result.state === 'denied') {
            dispatch(setLocationPermission(false));
            setError('Location permission denied');
          }

          // Listen for permission changes
          result.addEventListener('change', () => {
            dispatch(setLocationPermission(result.state === 'granted'));
            
            if (result.state === 'granted') {
              requestLocation();
            }
          });
        })
        .catch(err => {
          console.error('Error checking geolocation permission:', err);
        });
    }
  }, [dispatch, requestLocation]);

  // Update loading state when coordinates change
  useEffect(() => {
    if (coordinates) {
      setLoading(false);
    }
  }, [coordinates]);

  return {
    coordinates,
    loading,
    error,
    permissionGranted,
    requestLocation
  };
};
