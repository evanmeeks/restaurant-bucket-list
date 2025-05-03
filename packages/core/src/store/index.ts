import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// Configure redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist these reducers
};

// Combine all reducers
const rootReducer = {
  auth: authReducer,
  ui: uiReducer,
};

// Root saga
function* rootSaga() {
  yield all([
    // Add sagas here
  ]);
}

// Setup saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST'],
    },
    thunk: false,
  }), sagaMiddleware],
  devTools: process.env.NODE_ENV !== 'production',
});

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for use in components
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
