// This file is automatically loaded by Jest before tests run
// Add any global setup for tests here

// Mock global browser objects that might not exist in the Jest environment
global.navigator = global.navigator || {};
global.navigator.geolocation = global.navigator.geolocation || {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

global.navigator.permissions = global.navigator.permissions || {
  query: jest.fn().mockResolvedValue({
    state: 'granted',
    addEventListener: jest.fn()
  })
};

// Mock global env variables used by the app
process.env.FOURSQUARE_CLIENT_ID = 'mock-client-id';
process.env.FOURSQUARE_CLIENT_SECRET = 'mock-client-secret';

// Add global Jest matchers or other extensions here if needed
