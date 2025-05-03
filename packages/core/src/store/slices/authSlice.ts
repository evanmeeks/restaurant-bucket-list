import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserProfile } from '../../models/app-state';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Logout action
    logout: state => {
      state.loading = true;
    },
    logoutSuccess: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear error
    clearError: state => {
      state.error = null;
    },
  },
});

export const {
  login,
  loginSuccess,
  loginFailure,
  logout,
  logoutSuccess,
  logoutFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
