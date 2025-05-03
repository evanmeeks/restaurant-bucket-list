import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../models/app-state';

const initialState: UIState = {
  theme: 'light',
  networkStatus: 'online',
  hasCompletedOnboarding: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Network status actions
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline'>) => {
      state.networkStatus = action.payload;
    },
    
    // Onboarding actions
    completeOnboarding: state => {
      state.hasCompletedOnboarding = true;
    },
    resetOnboarding: state => {
      state.hasCompletedOnboarding = false;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setNetworkStatus,
  completeOnboarding,
  resetOnboarding,
} = uiSlice.actions;

export default uiSlice.reducer;
