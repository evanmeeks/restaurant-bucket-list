# Foursquare API Integration

This directory contains the integration with the Foursquare Places API for venue search and details. It includes:

- Service classes for interacting with the API
- Adapters for transforming API responses to our application models
- Tests and mocks for verifying functionality

## API Versions

There are two implementations of the Foursquare API:

### 1. foursquare.ts

This file contains the legacy implementation using the Foursquare Places API v2 (via the `@foursquare/foursquare-places` package). It requires:

- `FOURSQUARE_CLIENT_ID` 
- `FOURSQUARE_CLIENT_SECRET` 

### 2. foursquareV3.ts

This file contains the newer implementation using the Foursquare Places API v3. It requires:

- `FOURSQUARE_API_KEY`

## Usage Examples

### Searching for Nearby Venues

```typescript
import { foursquareServiceV3 } from './api/foursquareV3';

// User coordinates
const coordinates = {
  latitude: 41.8781,
  longitude: -87.6298
};

// Get nearby venues
const response = await foursquareServiceV3.searchNearbyVenues(coordinates);
console.log(`Found ${response.results.length} venues`);

// Search with a query
const burgers = await foursquareServiceV3.searchNearbyVenues(
  coordinates, 
  "burger"
);
console.log(`Found ${burgers.results.length} burger places`);

// Filter by category
const coffeeShops = await foursquareServiceV3.searchNearbyVenues(
  coordinates, 
  undefined, 
  ["13032"] // Coffee shop category ID
);
console.log(`Found ${coffeeShops.results.length} coffee shops`);
```

### Getting Recommended Venues

```typescript
import { foursquareServiceV3 } from './api/foursquareV3';

// User coordinates
const coordinates = {
  latitude: 41.8781,
  longitude: -87.6298
};

// Get recommended venues (sorted by rating)
const recommendations = await foursquareServiceV3.getRecommendedVenues(
  coordinates,
  5 // Limit to 5 venues
);

// Display the recommendations
recommendations.results.forEach(venue => {
  console.log(`${venue.name} - Rating: ${venue.rating}, Price: ${venue.price?.message}`);
});
```

### Getting Venue Details

```typescript
import { foursquareServiceV3 } from './api/foursquareV3';

// Get details for a specific venue
const venueId = '49dce73af964a520bb5f1fe3';
const venueDetails = await foursquareServiceV3.getVenueDetails(venueId);

console.log(`${venueDetails.name}`);
console.log(`Address: ${venueDetails.location.formattedAddress}`);
console.log(`Rating: ${venueDetails.rating}`);
console.log(`Description: ${venueDetails.description}`);
```

## API Response Adapter

The `FoursquareAdapter` class converts Foursquare API v3 responses to our internal model format. This centralizes the transformation logic and ensures consistent data structures throughout the application.

```typescript
import FoursquareAdapter from './adapters/foursquareAdapter';
import { foursquareServiceV3 } from './foursquareV3';

// Get raw API response
const apiResponse = await fetch('https://api.foursquare.com/v3/places/search?ll=41.8781,-87.6298');
const data = await apiResponse.json();

// Convert to our model format
const venues = FoursquareAdapter.mapSearchResponse(data);
```

## Testing

Tests use Mock Service Worker (MSW) to intercept API requests and provide consistent responses. Fixture data is stored in the `/mocks/fixtures` directory.

See the `__tests__` directory for examples of how to test the API integration.
