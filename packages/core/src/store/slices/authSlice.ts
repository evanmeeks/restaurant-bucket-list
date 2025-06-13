import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserProfile } from '../../models/app-state';

// Define a mock user for development
const MOCK_USER: UserProfile = {
  id: 'mock-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
};

// Define the initial state for the auth slice with mock user
const initialState: AuthState = {
  isAuthenticated: true, // Set to true for development
  user: MOCK_USER, // Include the mock user
  loading: false,
  error: null,
};

// Create the auth slice with reducers for login, logout, and error handling
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Handle login request
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      state.loading = true;
      state.error = null;
    },
    // Handle successful login
    loginSuccess(state, action: PayloadAction<UserProfile>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Handle login failure
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Handle logout request
    logout(state) {
      state.loading = true;
      state.error = null;
    },
    // Handle successful logout
    logoutSuccess(state) {
      // For development, we'll keep the mock user logged in
      if (process.env.NODE_ENV !== 'development') {
        state.isAuthenticated = false;
        state.user = null;
      } else {
        state.isAuthenticated = true;
        state.user = MOCK_USER;
      }
      state.loading = false;
      state.error = null;
    },
    // Handle logout failure
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear any existing error
    clearError(state) {
      state.error = null;
    },

    // Reset to mock user (for development only)
    resetToMockUser(state) {
      state.isAuthenticated = true;
      state.user = MOCK_USER;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export the action creators
export const {
  login,
  loginSuccess,
  loginFailure,
  logout,
  logoutSuccess,
  logoutFailure,
  clearError,
  resetToMockUser,
} = authSlice.actions;

// Export the reducer as the default export
export default authSlice.reducer;

// Export types for use in sagas and components
export type LoginPayload = { email: string; password: string };
export type LoginSuccessPayload = UserProfile;
export type ErrorPayload = string;
