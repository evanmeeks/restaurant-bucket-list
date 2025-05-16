import { http, HttpResponse } from 'msw';
import venuesFixture from '../fixtures/venues.json';
import venueDetailsFixture from '../fixtures/venue-details.json';

// Define the Foursquare API base URL
const FOURSQUARE_API_BASE_URL = 'https://api.foursquare.com/v3';

export const venueHandlers = [
  // Handler for getting recommended venues
  http.get(`${FOURSQUARE_API_BASE_URL}/places/search`, () => {
    return HttpResponse.json(venuesFixture);
  }),

  // Handler for getting venue details by ID
  http.get(`${FOURSQUARE_API_BASE_URL}/places/:venueId`, ({ params }) => {
    const { venueId } = params;
    return HttpResponse.json({
      ...venueDetailsFixture,
      id: venueId || venueDetailsFixture.fsq_id
    });
  }),

  // Handler for simulating errors
  http.get(`${FOURSQUARE_API_BASE_URL}/places/error-test`, () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error'
    });
  })
];
