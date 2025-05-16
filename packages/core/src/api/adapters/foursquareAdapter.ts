import { Venue, VenueSearchResponse, VenueDetailsResponse } from '../../models/venue';

/**
 * Adapter to convert Foursquare API v3 responses to our app's model format
 */
export class FoursquareAdapter {
  /**
   * Convert a Foursquare API v3 search response to our app's VenueSearchResponse format
   */
  public static mapSearchResponse(response: any): VenueSearchResponse {
    return {
      results: response.results.map(this.mapVenue),
      context: {
        geoBounds: response.context?.geoBounds || {
          circle: {
            center: {
              latitude: 0,
              longitude: 0
            },
            radius: 0
          }
        }
      },
      totalResults: response.totalResults || response.results.length
    };
  }

  /**
   * Convert a Foursquare API v3 venue/place details response to our app's Venue format
   */
  public static mapVenueDetails(response: any): VenueDetailsResponse {
    return this.mapVenue(response);
  }

  /**
   * Map a Foursquare API v3 venue/place to our app's Venue model
   */
  private static mapVenue(v3Venue: any): Venue {
    return {
      id: v3Venue.fsq_id,
      name: v3Venue.name,
      location: {
        address: v3Venue.location?.address,
        city: v3Venue.location?.locality,
        state: v3Venue.location?.region,
        country: v3Venue.location?.country,
        postalCode: v3Venue.location?.postcode,
        neighborhood: v3Venue.location?.neighborhood ? v3Venue.location.neighborhood[0] : undefined,
        formattedAddress: v3Venue.location?.formatted_address,
        crossStreet: v3Venue.location?.cross_street,
        lat: v3Venue.geocodes?.main?.latitude,
        lng: v3Venue.geocodes?.main?.longitude,
      },
      categories: v3Venue.categories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: {
          prefix: cat.icon?.prefix,
          suffix: cat.icon?.suffix,
        },
        primary: cat.primary || false,
      })) || [],
      rating: v3Venue.rating,
      ratingColor: v3Venue.ratingColor,
      photos: v3Venue.photos?.map((photo: any) => ({
        id: photo.id,
        prefix: photo.prefix,
        suffix: photo.suffix,
        width: photo.width,
        height: photo.height,
      })) || [],
      price: v3Venue.price ? {
        tier: v3Venue.price,
        message: this.getPriceMessage(v3Venue.price),
        currency: 'USD', // Default to USD
      } : undefined,
      hours: v3Venue.hours ? {
        status: v3Venue.hours.status || v3Venue.hours.display,
        isOpen: v3Venue.closed_bucket === 'LikelyOpen' || v3Venue.closed_bucket === 'VeryLikelyOpen',
      } : undefined,
      contact: {
        phone: v3Venue.tel,
        formattedPhone: v3Venue.tel,
        twitter: v3Venue.social_media?.twitter,
        instagram: v3Venue.social_media?.instagram,
        facebook: v3Venue.social_media?.facebook,
        url: v3Venue.website,
      },
      description: v3Venue.description,
      url: v3Venue.website,
      verified: !!v3Venue.verified,
      stats: v3Venue.stats || {
        tipCount: 0,
        usersCount: 0,
        checkinsCount: 0,
      },
      distances: v3Venue.distance,
      menu: v3Venue.menu ? {
        url: v3Venue.menu.url,
        mobileUrl: v3Venue.menu.mobileUrl || v3Venue.menu.url,
      } : undefined
    };
  }

  /**
   * Helper method to convert price tier to message
   */
  private static getPriceMessage(tier: number): string {
    switch (tier) {
      case 1:
        return '$';
      case 2:
        return '$$';
      case 3:
        return '$$$';
      case 4:
        return '$$$$';
      default:
        return '$';
    }
  }
}

// Export the adapter for use in the application
export default FoursquareAdapter;
