import Foursquare from '@foursquare/foursquare-places';

import {
  Coordinates,
  VenueDetailsResponse,
  VenueSearchParams,
  VenueSearchResponse,
} from '../models/venue';
import { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET } from '../utils/env';

// alert(JSON.stringify(process.env));
// Load CLIENT_ID and CLIENT_SECRET from environment variables
// const CLIENT_ID = process.env.FOURSQUARE_CLIENT_ID;
// const CLIENT_SECRET = process.env.FOURSQUARE_CLIENT_SECRET;

// Validate environment variables
if (!FOURSQUARE_CLIENT_ID || !FOURSQUARE_CLIENT_SECRET) {
  throw new Error(
    'Foursquare process.env.FOURSQUARE_CLIENT_ID and process.env.FOURSQUARE_CLIENT_SECRET must be defined in the environment variables'
  );
}

// Initialize the Foursquare client with v2 API credentials
// Initialize the Foursquare client with v2 API credentials
const foursquare = new Foursquare(
  FOURSQUARE_CLIENT_ID, // Remove the ! operator
  FOURSQUARE_CLIENT_SECRET
);
/**
 * Foursquare API service using @foursquare/foursquare-places wrapper:
 * - TypeScript for type safety
 * - Environment variables for configuration
 * - Proper error handling
 * - Clean abstraction
 */
export class FoursquareService {
  private static instance: FoursquareService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): FoursquareService {
    if (!FoursquareService.instance) {
      FoursquareService.instance = new FoursquareService();
    }
    return FoursquareService.instance;
  }

  /**
   * Search for venues near the specified location
   */
  public async searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse> {
    try {
      // Map VenueSearchParams to the format expected by @foursquare/foursquare-places
      const searchParams = {
        ll: params.ll,
        query: params.query,
        categoryId: params.categories,
        radius: params.radius,
        limit: params.limit || 20,
        sort: params.sort || 'DISTANCE',
      };

      const response = await foursquare.venues.getVenues(searchParams);
      return {
        results: response.response.venues.map(this.mapV2VenueToV3Venue), // Map v2 response to v3 format
        context: response.response.context || null, // Add context property
        totalResults: response.response.totalResults || 0, // Add totalResults property
      };
    } catch (error: any) {
      console.error('Failed to search venues:', error);
      throw error;
    }
  }

  /**
   * Find venues strictly by latitude and longitude
   */
  public async fetchVenues({ latitude, longitude }: Coordinates): Promise<any[]> {
    const response = await fetch(
      `https://api.foursquare.com/v3/places/search?query=&ll=${latitude},${longitude}`,
      {
        headers: {
          accept: 'application/json',
          'accept-language': 'en-US,en;q=0.9',
          authorization: 'fsq36FEPfDna8FEIc6x4QcQ3Kl+DsUIZ+goGfv1jqdtplbs=',
          priority: 'u=1, i',
          'Access-Control-Allow-Origin': '*',
        },
        referrer: 'https://docs.foursquare.com/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch venues');
    }

    const data = await response.json();
    return data.results || []; // Assuming the venues are in a 'results' property
  }

  /**
   * Get venue details by ID
   */
  public async getVenueDetails(venueId: string): Promise<VenueDetailsResponse> {
    try {
      const response = await foursquare.venues.getVenue({ VENUE_ID: venueId });
      return this.mapV2VenueToV3Venue(response.response.venue);
    } catch (error: any) {
      console.error(`Failed to get venue details for ID ${venueId}:`, error);
      throw error;
    }
  }

  /**
   * Search venues near the user's current location
   */
  public async searchNearbyVenues(
    coordinates: Coordinates,
    query?: string,
    categories?: string[],
    radius = 1000,
    limit = 20
  ): Promise<VenueSearchResponse> {
    const params: VenueSearchParams = {
      ll: `${coordinates.latitude},${coordinates.longitude}`,
      radius,
      limit,
    };

    if (query) {
      params.query = query;
    }

    if (categories && categories.length > 0) {
      params.categories = categories.join(',');
    }

    return this.searchVenues(params);
  }

  /**
   * Get recommended venues near the specified location
   */
  public async getRecommendedVenues(
    coordinates: Coordinates,
    limit = 10
  ): Promise<VenueSearchResponse> {
    return this.searchVenues({
      ll: `${coordinates.latitude},${coordinates.longitude}`,
      limit,
      sort: 'RATING', // Note: v2 API doesn't support sort=RATING directly, we may need to sort client-side
    });
  }

  /**
   * Map Foursquare v2 venue response to v3-compatible format
   */
  private mapV2VenueToV3Venue(v2Venue: any): any {
    return {
      id: v2Venue.id,
      name: v2Venue.name,
      location: {
        address: v2Venue.location.address,
        city: v2Venue.location.city,
        state: v2Venue.location.state,
        country: v2Venue.location.country,
        postalCode: v2Venue.location.postalCode,
        lat: v2Venue.location.lat,
        lng: v2Venue.location.lng,
        formattedAddress: v2Venue.location.formattedAddress?.join(', '),
      },
      categories:
        v2Venue.categories?.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: {
            prefix: cat.icon?.prefix,
            suffix: cat.icon?.suffix,
          },
        })) || [],
      rating: v2Venue.rating,
      ratingColor: v2Venue.ratingColor,
      photos:
        v2Venue.photos?.groups?.flatMap((group: any) =>
          group.items.map((item: any) => ({
            id: item.id,
            prefix: item.prefix,
            suffix: item.suffix,
            width: item.width,
            height: item.height,
          }))
        ) || [],
      price: v2Venue.price
        ? {
            tier: v2Venue.price.tier,
            message: v2Venue.price.message,
            currency: v2Venue.price.currency,
          }
        : undefined,
      hours: v2Venue.hours
        ? {
            status: v2Venue.hours.status,
            isOpen: v2Venue.hours.isOpen,
          }
        : undefined,
      contact: {
        phone: v2Venue.contact?.phone,
        formattedPhone: v2Venue.contact?.formattedPhone,
        twitter: v2Venue.contact?.twitter,
        instagram: v2Venue.contact?.instagram,
        facebook: v2Venue.contact?.facebook,
        url: v2Venue.url,
      },
      description: v2Venue.description,
      url: v2Venue.url,
      verified: v2Venue.verified,
    };
  }
}

// Export a singleton instance
export const foursquareService = FoursquareService.getInstance();
