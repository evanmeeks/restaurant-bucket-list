import { FOURSQUARE_API_KEY, API_URL } from '../utils/env';
import { Coordinates } from '../models/venue';

// React Native-compatible HTTP client instead of Axios
class ReactNativeHTTPClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.headers = headers;
  }

  async get(endpoint: string, options: { params?: Record<string, any> } = {}) {
    const { params = {} } = options;
    
    // Build URL with query parameters (avoiding URL constructor)
    let url = this.baseURL + endpoint;
    
    const queryParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
      .join('&');
    
    if (queryParams) {
      url += '?' + queryParams;
    }

    console.log('🌐 Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  }
}

// Create a React Native-compatible client
const foursquareClient = new ReactNativeHTTPClient(API_URL, {
  'Accept': 'application/json',
  'Authorization': FOURSQUARE_API_KEY,
});

/**
 * FoursquareV3Service - A service for interacting with the Foursquare Places API v3
 * Modified to use fetch instead of Axios for React Native compatibility
 */
export class FoursquareV3Service {
  private static instance: FoursquareV3Service;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): FoursquareV3Service {
    if (!FoursquareV3Service.instance) {
      FoursquareV3Service.instance = new FoursquareV3Service();
    }
    return FoursquareV3Service.instance;
  }

  /**
   * Search for venues near a specified location
   */
  public async searchVenues(params: {
    ll: string;
    query?: string;
    categories?: string;
    radius?: number;
    limit?: number;
    sort?: string;
  }) {
    try {
      console.log('🔍 Searching venues with params:', params);
      const response = await foursquareClient.get('/places/search', { params });
      console.log('✅ Venues search successful');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to search venues:', error);
      throw error;
    }
  }

  /**
   * Get venue details by ID
   */
  public async getVenueDetails(venueId: string) {
    try {
      const response = await foursquareClient.get(`/places/${venueId}`);
      return response.data;
    } catch (error) {
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
    radius: number = 1000,
    limit: number = 20
  ) {
    const params: any = {
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
    limit: number = 10
  ) {
    return this.searchVenues({
      ll: `${coordinates.latitude},${coordinates.longitude}`,
      limit,
      sort: 'RATING',
    });
  }
}

// Export a singleton instance
export const foursquareV3Service = FoursquareV3Service.getInstance();
