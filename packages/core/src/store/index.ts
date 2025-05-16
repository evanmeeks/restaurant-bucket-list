import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Use AsyncStorage

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
  storage: AsyncStorage, // Use AsyncStorage for React Native
  whitelist: ['auth', 'bucketList', 'ui'],
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

// Setup saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Include REHYDRATE
      },
      thunk: false,
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Test AsyncStorage
AsyncStorage.getItem('test')
  .then(() => console.log('AsyncStorage is working'))
  .catch(err => console.error('AsyncStorage error:', err));

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
