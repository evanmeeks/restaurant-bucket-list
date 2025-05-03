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
import { 
  getUserLocation, 
  setUserLocation, 
  locationError,
  setLocationPermission
} from '../slices/venuesSlice';
import { Coordinates } from '../../models/venue';

// Create a channel to handle watch position
function createLocationChannel() {
  return eventChannel(emitter => {
    // Watch position and emit location updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        emitter({ latitude, longitude });
      },
      (error) => {
        emitter(END);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10 // Minimum distance (meters) between updates
      }
    );

    // Return unsubscribe function
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  });
}

// Get current position once
function* getCurrentPosition() {
  try {
    const position = yield call(
      () => 
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 1000
            }
          );
        })
    );
    
    const coordinates: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    yield put(setUserLocation(coordinates));
    yield put(setLocationPermission(true));
    
    return coordinates;
  } catch (error) {
    console.error('Error getting current position:', error);
    yield put(locationError(error.message));
    
    if (error.code === 1) {
      // Permission denied
      yield put(setLocationPermission(false));
    }
    
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
        yield put(locationError(error.message));
      }
    }
  } catch (error) {
    console.error('Error creating location channel:', error);
    yield put(locationError(error.message));
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
