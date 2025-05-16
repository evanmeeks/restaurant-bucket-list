// This file is automatically loaded by Jest before tests run
// Add any global setup for tests here
import { server } from '../mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that were added during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock global browser objects that might not exist in the Jest environment
Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    },
    permissions: {
      query: jest.fn().mockResolvedValue({
        state: 'granted',
        addEventListener: jest.fn()
      })
    }
  },
  writable: true,
  configurable: true
});

// Mock global env variables used by the app
process.env.FOURSQUARE_CLIENT_ID = 'mock-client-id';
process.env.FOURSQUARE_CLIENT_SECRET = 'mock-client-secret';
process.env.FOURSQUARE_API_KEY = 'mock-api-key';

// Add global Jest matchers or other extensions here if needed
