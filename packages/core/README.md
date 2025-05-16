# Restaurant Bucket List - Core Package

This package contains the shared core functionality for the Restaurant Bucket List application.

## Features

- Foursquare API integration for venue search and details
- Redux store with slices and sagas
- React hooks for geolocation and other app features
- Shared models and utilities

## Getting Started

1. Install dependencies:

```bash
yarn install
```

2. Build the package:

```bash
yarn build
```

3. Run tests:

```bash
yarn test
```

## Testing with MSW

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) to mock API requests during testing. All mock configurations and fixtures are stored in the `/mocks` directory.

To run specific tests with mock coverage, use the provided script:

```bash
# Make sure the script is executable first
chmod +x run-tests.sh

# Run the tests
./run-tests.sh
```

## Foursquare API Integration

The application integrates with the Foursquare Places API for venue search and details. See the [API README](./src/api/README.md) for details and usage examples.

## Directory Structure

- `/src`: Source code
  - `/api`: API integration code
    - `/adapters`: API response adapters
    - `/__tests__`: API tests
  - `/hooks`: React hooks
  - `/models`: TypeScript interfaces and types
  - `/store`: Redux store
    - `/sagas`: Redux sagas
    - `/slices`: Redux slices
  - `/utils`: Utility functions
- `/mocks`: Mock service worker setup
  - `/fixtures`: API response fixtures

## Environment Variables

The following environment variables are required:

- `FOURSQUARE_API_KEY`: API key for Foursquare Places API v3
- `FOURSQUARE_CLIENT_ID`: Client ID for Foursquare Places API v2 (legacy)
- `FOURSQUARE_CLIENT_SECRET`: Client secret for Foursquare Places API v2 (legacy)

## Credits

This package is part of the Restaurant Bucket List application.
