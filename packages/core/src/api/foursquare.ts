import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  VenueSearchParams, 
  VenueSearchResponse, 
  VenueDetailsResponse,
  Coordinates
} from '../models/venue';

/**
 * Foursquare API service using modern patterns:
 * - TypeScript for type safety
 * - Axios for HTTP requests
 * - Environment variables for configuration
 * - Proper error handling
 * - Clean abstraction
 */
export class FoursquareService {
  private client: AxiosInstance;
  private static instance: FoursquareService;
  
  private constructor() {
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: 'https://api.foursquare.com/v3',
      headers: {
        'Accept': 'application/json',
        'Authorization': `${process.env.FOURSQUARE_API_KEY}`
      }
    });
    
    // Add request interceptor for logging and modifying requests
    this.client.interceptors.request.use(
      (config) => {
        // Add any request modification here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Enhanced error handling
        if (error.response) {
          // Server responded with error status
          console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          // Request made but no response received
          console.error('Network Error:', error.request);
        } else {
          // Error in setting up request
          console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
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
      const response = await this.client.get('/places/search', {
        params: {
          ...params,
          limit: params.limit || 20,
          sort: params.sort || 'DISTANCE'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search venues:', error);
      throw error;
    }
  }
  
  /**
   * Get venue details by ID
   */
  public async getVenueDetails(venueId: string): Promise<VenueDetailsResponse> {
    try {
      const response = await this.client.get(`/places/${venueId}`);
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
  ): Promise<VenueSearchResponse> {
    const params: VenueSearchParams = {
      ll: `${coordinates.latitude},${coordinates.longitude}`,
      radius,
      limit
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
  ): Promise<VenueSearchResponse> {
    return this.searchVenues({
      ll: `${coordinates.latitude},${coordinates.longitude}`,
      limit,
      sort: 'RATING'
    });
  }
}

// Export a singleton instance
export const foursquareService = FoursquareService.getInstance();
