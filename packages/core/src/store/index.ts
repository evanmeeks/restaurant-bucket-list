import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers
import authReducer from './slices/authSlice';
import venuesReducer from './slices/venuesSlice';
import bucketListReducer from './slices/bucketListSlice';
import uiReducer from './slices/uiSlice';

// Import root saga
import { rootSaga } from './rootSaga';

// Configure redux-persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'bucketList', 'ui'],
  debug: __DEV__,
};

// Combine all reducers
const rootReducer = {
  auth: authReducer,
  venues: venuesReducer,
  bucketList: bucketListReducer,
  ui: uiReducer,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

// Setup saga middleware with monitoring
const sagaMiddleware = createSagaMiddleware({
  sagaMonitor: __DEV__ ? console.tron?.createSagaMonitor?.() : undefined,
});

// Redux DevTools enhancer for React Native
const createDebugger = () => {
  if (__DEV__) {
    // For React Native Debugger
    const composeEnhancers = (global as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (composeEnhancers) {
      return composeEnhancers({
        name: 'Restaurant Bucket List',
        trace: true,
        traceLimit: 25,
      });
    }
    
    // For Flipper Redux plugin
    if ((global as any).__FLIPPER__) {
      const flipperEnhancer = require('redux-flipper').default();
      return flipperEnhancer;
    }
  }
  return undefined;
};

// Configure store with enhanced dev tools
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE', 
          'persist/PAUSE', 
          'persist/PURGE', 
          'persist/REGISTER'
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      thunk: false,
      immutableCheck: {
        warnAfter: 128,
      },
    }).concat(sagaMiddleware),
  devTools: __DEV__ && {
    name: 'Restaurant Bucket List',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      payload: action.type.includes('password') ? '[HIDDEN]' : action.payload,
    }),
    stateSanitizer: (state) => ({
      ...state,
      auth: {
        ...state.auth,
      },
    }),
  },
  enhancers: __DEV__ ? [createDebugger()].filter(Boolean) : [],
});

// Enhanced AsyncStorage testing
if (__DEV__) {
  AsyncStorage.getItem('test')
    .then(() => console.log('✅ AsyncStorage is working'))
    .catch(err => console.error('❌ AsyncStorage error:', err));
}

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Create persistor
export const persistor = persistStore(store, null, () => {
  if (__DEV__) {
    console.log('✅ Redux persist rehydration complete');
  }
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Development tools and debugging helpers
if (__DEV__) {
  // Global store access for debugging
  (global as any).store = store;
  (global as any).getState = () => store.getState();
  (global as any).dispatch = store.dispatch;
  
  // Helper functions for bucket list debugging
  (global as any).getBucketList = () => store.getState().bucketList;
  (global as any).getAuth = () => store.getState().auth;
  (global as any).clearBucketList = () => AsyncStorage.removeItem('bucketList_mock-user-1');
  (global as any).viewAsyncStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    console.log('AsyncStorage contents:', stores);
    return stores;
  };
  
  // Action dispatchers for debugging
  (global as any).debugActions = {
    fetchBucketList: () => store.dispatch({ type: 'bucketList/fetchBucketList' }),
    addTestItem: () => store.dispatch({
      type: 'bucketList/addToBucketList',
      payload: {
        fsq_id: 'test-venue-' + Date.now(),
        name: 'Test Restaurant',
        categories: [{ name: 'Restaurant' }],
        location: { formatted_address: 'Test Address' }
      }
    }),
  };
  
  // Log initial state
  console.log('🏪 Redux Store initialized');
  console.log('📊 Initial State:', store.getState());
  
  // Subscribe to state changes for debugging
  store.subscribe(() => {
    const state = store.getState();
    console.log('🔄 State updated - Bucket List items:', state.bucketList.items.length);
  });
}
