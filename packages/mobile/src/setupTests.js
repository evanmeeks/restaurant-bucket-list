// This file is automatically loaded by Jest before tests run
// Add any global setup for tests here

// Mock the react-native modules that might not be available in the Jest environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock the react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock the AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock the geolocation
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.NativeModules.RNPermissions = {
    check: jest.fn(() => Promise.resolve(true)),
    request: jest.fn(() => Promise.resolve(true)),
  };
  rn.PermissionsAndroid = {
    ...rn.PermissionsAndroid,
    check: jest.fn(() => Promise.resolve(true)),
    request: jest.fn(() => Promise.resolve(true)),
  };
  return rn;
});

// Mock the Dimensions API to return a fixed size
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 667,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock the foursquareV3Service from the core package
jest.mock('core', () => ({
  foursquareV3Service: {
    searchNearbyVenues: jest.fn().mockResolvedValue({
      results: [
        {
          fsq_id: 'mock-id-1',
          name: 'Mock Restaurant 1',
          location: {
            address: '123 Main St',
            locality: 'Austin',
            region: 'TX',
          },
          categories: [
            {
              id: 13000,
              name: 'Restaurant',
              icon: {
                prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
                suffix: '.png',
              },
            },
          ],
        },
        {
          fsq_id: 'mock-id-2',
          name: 'Mock Restaurant 2',
          location: {
            address: '456 Oak St',
            locality: 'Austin',
            region: 'TX',
          },
          categories: [
            {
              id: 13000,
              name: 'Restaurant',
              icon: {
                prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
                suffix: '.png',
              },
            },
          ],
        },
      ],
    }),
    getVenueDetails: jest.fn().mockResolvedValue({
      fsq_id: 'mock-id-1',
      name: 'Mock Restaurant Details',
      location: {
        address: '123 Main St',
        locality: 'Austin',
        region: 'TX',
      },
      categories: [
        {
          id: 13000,
          name: 'Restaurant',
          icon: {
            prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
            suffix: '.png',
          },
        },
      ],
      hours: {
        display: 'Open until 10:00 PM',
        is_local_holiday: false,
        open_now: true,
      },
      rating: 4.7,
      photos: [
        {
          id: 'photo-1',
          prefix: 'https://fastly.4sqi.net/img/general/',
          suffix: '/1234567_abcdefg_1234567890.jpg',
          width: 800,
          height: 600,
        },
      ],
    }),
    getRecommendedVenues: jest.fn().mockResolvedValue({
      results: [
        {
          fsq_id: 'mock-id-3',
          name: 'Top Rated Restaurant',
          location: {
            address: '789 Pine St',
            locality: 'Austin',
            region: 'TX',
          },
          categories: [
            {
              id: 13000,
              name: 'Restaurant',
              icon: {
                prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
                suffix: '.png',
              },
            },
          ],
          rating: 4.9,
        },
        {
          fsq_id: 'mock-id-4',
          name: 'Popular Coffee Shop',
          location: {
            address: '101 Market St',
            locality: 'Austin',
            region: 'TX',
          },
          categories: [
            {
              id: 13032,
              name: 'Coffee Shop',
              icon: {
                prefix: 'https://ss3.4sqi.net/img/categories_v2/food/coffeeshop_',
                suffix: '.png',
              },
            },
          ],
          rating: 4.8,
        },
      ],
    }),
  },
  Coordinates: class {
    latitude: number;
    longitude: number;
    constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  },
}));

// Silence the React Native Logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
