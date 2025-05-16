import { http, HttpResponse } from 'msw';
import * as fs from 'fs';
import * as path from 'path';

// Define the Foursquare API base URL
const FOURSQUARE_API_BASE_URL = 'https://api.foursquare.com/v3';

// Load fixtures dynamically
const loadFixture = (fixtureName: string) => {
  try {
    const fixturePath = path.join(__dirname, 'fixtures', `${fixtureName}.json`);
    if (fs.existsSync(fixturePath)) {
      const fixtureContent = fs.readFileSync(fixturePath, 'utf8');
      return JSON.parse(fixtureContent);
    }
    // If fixture doesn't exist, return a default response
    console.warn(`Fixture ${fixtureName} not found, using fallback data`);
    return getFallbackData(fixtureName);
  } catch (error) {
    console.error(`Error loading fixture ${fixtureName}:`, error);
    return getFallbackData(fixtureName);
  }
};

// Get fallback data when a fixture doesn't exist
const getFallbackData = (fixtureName: string) => {
  if (fixtureName.includes('venue_details')) {
    return {
      fsq_id: 'mock-venue-id',
      name: 'Mock Venue Details',
      description: 'A detailed description of this mock venue',
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
      location: {
        address: '123 Test St',
        locality: 'Austin',
        region: 'TX',
      },
      rating: 4.7,
    };
  }
  
  return {
    results: [
      {
        fsq_id: 'mock-venue-1',
        name: 'Mock Restaurant',
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
        location: {
          address: '123 Test St',
          locality: 'Austin',
          region: 'TX',
        },
      },
    ],
  };
};

// Handler to intercept Foursquare API requests and return fixture data
export const handlers = [
  // Search endpoint
  http.get(`${FOURSQUARE_API_BASE_URL}/places/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const ll = url.searchParams.get('ll');
    const sort = url.searchParams.get('sort');
    
    // Determine which fixture to use
    let fixtureName = 'search_restaurants_austin'; // default
    
    if (sort === 'RATING') {
      fixtureName = 'recommended_venues_austin';
    } else if (query) {
      if (query.toLowerCase().includes('coffee')) {
        fixtureName = 'search_coffee_austin';
      } else if (query.toLowerCase().includes('restaurant')) {
        fixtureName = 'search_restaurants_austin';
      }
    }
    
    return HttpResponse.json(loadFixture(fixtureName));
  }),

  // Venue details endpoint
  http.get(`${FOURSQUARE_API_BASE_URL}/places/:venueId`, ({ params }) => {
    const { venueId } = params;
    
    // Use specific fixture for known venue IDs or fallback to generic
    let fixtureName;
    if (venueId === '4df44456d1add5a8baa15599') {
      fixtureName = 'venue_details_franklin';
    } else {
      fixtureName = `venue_details_${venueId}`;
    }
    
    return HttpResponse.json(loadFixture(fixtureName));
  }),
];
