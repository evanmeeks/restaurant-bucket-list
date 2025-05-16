import { 
  takeLatest, 
  call, 
  put, 
  spawn,
  take, 
  cancel, 
  fork,
  cancelled,
  delay
} from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import * as Location from 'expo-location'; // Import expo-location
import { 
  getUserLocation, 
  setUserLocation, 
  setLocationPermission,
  fetchNearbyVenuesFailure
} from '../slices/venuesSlice';
import { Coordinates } from '../../models/venue';

// Create a channel for location updates
function createLocationChannel() {
  return eventChannel(emitter => {
    // Use expo-location instead of navigator.geolocation
    let watchId;
    
    const startWatching = async () => {
      try {
        // Request permissions first
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          emitter(END);
          return;
        }
        
        // Start watching position
        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            emitter({ latitude, longitude });
          }
        );
      } catch (error) {
        console.error('Error watching location:', error);
        emitter(END);
      }
    };
    
    // Start watching location
    startWatching();
    
    // Return unsubscribe function
    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  });
}

// Get current position once
function* getCurrentPosition() {
  try {
    // Request permissions first
    const permissionResponse = yield call(Location.requestForegroundPermissionsAsync);
    
    if (permissionResponse.status !== 'granted') {
      console.log('Location permission not granted');
      yield put(setLocationPermission(false));
      yield put(fetchNearbyVenuesFailure('Location permission denied'));
      return null;
    }
    
    // Set permission granted
    yield put(setLocationPermission(true));
    
    // Get current position
    const position = yield call(Location.getCurrentPositionAsync, {
      accuracy: Location.Accuracy.Balanced
    });
    
    const coordinates: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    yield put(setUserLocation(coordinates));
    
    return coordinates;
  } catch (error) {
    console.error('Error getting current position:', error);
    yield put(fetchNearbyVenuesFailure('Failed to get location: ' + error.message));
    return null;
  }
}

// Watch for location updates
function* watchLocationUpdates() {
  try {
    const channel = yield call(createLocationChannel);
    
    // Process location updates
    while (true) {
      try {
        const coordinates = yield take(channel);
        yield put(setUserLocation(coordinates));
      } catch (error) {
        console.error('Error in location channel:', error);
        yield put(fetchNearbyVenuesFailure('Location update error: ' + error.message));
      }
    }
  } catch (error) {
    console.error('Error creating location channel:', error);
    yield put(fetchNearbyVenuesFailure('Location channel error: ' + error.message));
  } finally {
    if (yield cancelled()) {
      console.log('Location watching cancelled');
    }
  }
}

// Handle get user location action
function* handleGetUserLocation() {
  // First get current position
  const coordinates = yield call(getCurrentPosition);
  
  // If successful, start watching for updates
  if (coordinates) {
    // Start watching location in background
    const watchTask = yield fork(watchLocationUpdates);
    
    // Automatically cancel the watch after 30 minutes
    // to conserve battery (can be adjusted based on requirements)
    yield spawn(function* () {
      yield delay(30 * 60 * 1000); // 30 minutes
      yield cancel(watchTask);
    });
  }
}

// Watch for location actions
export function* watchLocation() {
  yield takeLatest(getUserLocation.type, handleGetUserLocation);
}
