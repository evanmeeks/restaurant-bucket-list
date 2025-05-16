import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { FOURSQUARE_API_KEY } from '../src/utils/env';

/**
 * Utility to capture Foursquare API responses and save them as fixtures
 */
const captureFixtures = async () => {
  const fixturesDir = path.join(__dirname, '..', 'mocks', 'fixtures');

  // Ensure the fixtures directory exists
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const client = axios.create({
    baseURL: 'https://api.foursquare.com/v3',
    headers: {
      Accept: 'application/json',
      Authorization: FOURSQUARE_API_KEY,
    },
  });

  // Define the endpoints and parameters to capture
  const endpoints = [
    {
      name: 'search_restaurants_austin',
      path: '/places/search',
      params: {
        ll: '30.2672,-97.7431',
        query: 'restaurant',
        radius: '1000',
        limit: '10',
      },
    },
    {
      name: 'search_coffee_austin',
      path: '/places/search',
      params: {
        ll: '30.2672,-97.7431',
        query: 'coffee',
        radius: '1000',
        limit: '10',
      },
    },
    {
      name: 'recommended_venues_austin',
      path: '/places/search',
      params: {
        ll: '30.2672,-97.7431',
        sort: 'RATING',
        limit: '10',
      },
    },
    // Add specific venue IDs from your application
    {
      name: 'venue_details_franklin',
      path: '/places/4df44456d1add5a8baa15599', // Franklin Barbecue
      params: {},
    },
  ];

  // Capture responses for each endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(`Capturing fixture for ${endpoint.name}...`);
      const response = await client.get(endpoint.path, { params: endpoint.params });

      // Write the response data to a JSON file
      const fixturePath = path.join(fixturesDir, `${endpoint.name}.json`);
      fs.writeFileSync(fixturePath, JSON.stringify(response.data, null, 2));

      console.log(`✅ Saved fixture to ${fixturePath}`);
    } catch (error) {
      console.error(`❌ Error capturing fixture for ${endpoint.name}:`, error);
    }
  }

  console.log('Fixture capture completed!');
};

// Run the capture if this file is executed directly
if (require.main === module) {
  captureFixtures().catch(console.error);
}

export { captureFixtures };
