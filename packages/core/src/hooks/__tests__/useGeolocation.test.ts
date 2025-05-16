import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useGeolocation } from '../useGeolocation';
import { useAppDispatch, useAppSelector } from '../../store';
import { getUserLocation } from '../../store/slices/venuesSlice';

// Mock the modules
jest.mock('../../store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn()
}));

jest.mock('../../store/slices/venuesSlice', () => ({
  getUserLocation: jest.fn().mockReturnValue({ type: 'location/getUserLocation' }),
  setLocationPermission: jest.fn().mockReturnValue({ type: 'location/setLocationPermission' })
}));

describe('useGeolocation', () => {
  // Setup common mocks
  const mockDispatch = jest.fn();
  
  // Mock user location for selector
  const mockUserLocation = { latitude: 41.8781, longitude: -87.6298 };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock dispatcher
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    
    // By default, mock no coordinates and permission not granted
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        venues: {
          userLocation: null,
          locationPermissionGranted: false
        }
      };
      return selector(mockState);
    });
  });
  
  it('should dispatch getUserLocation when requestLocation is called', () => {
    // Render the hook
    const { result } = renderHook(() => useGeolocation());
    
    // Call requestLocation inside act to handle state updates
    act(() => {
      result.current.requestLocation();
    });
    
    // Verify the action was dispatched
    expect(getUserLocation).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
  });
  
  it('should return the coordinates from state', () => {
    // Setup mock to return coordinates
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        venues: {
          userLocation: mockUserLocation,
          locationPermissionGranted: true
        }
      };
      return selector(mockState);
    });
    
    // Render the hook
    const { result } = renderHook(() => useGeolocation());
    
    // Verify coordinates are returned from state
    expect(result.current.coordinates).toBe(mockUserLocation);
    expect(result.current.permissionGranted).toBe(true);
  });
  
  it('should set loading to false when coordinates are available', () => {
    // Setup mock to return coordinates
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        venues: {
          userLocation: mockUserLocation,
          locationPermissionGranted: true
        }
      };
      return selector(mockState);
    });
    
    // Render the hook
    const { result } = renderHook(() => useGeolocation());
    
    // Verify loading state is false when coordinates are available
    expect(result.current.loading).toBe(false);
  });
  
  it('should set error message when geolocation is not supported', () => {
    // Save original navigator
    const originalNavigator = global.navigator;
    
    // Mock navigator without geolocation
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        geolocation: undefined
      },
      configurable: true,
      writable: true
    });
    
    // Render the hook
    const { result } = renderHook(() => useGeolocation());
    
    // Verify error message is set
    expect(result.current.error).toBe('Geolocation is not supported by your browser');
    
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
  });
});
