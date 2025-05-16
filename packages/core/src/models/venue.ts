/**
 * Geographical coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Parameters for venue search API
 */
export interface VenueSearchParams {
  // Required: Latitude and longitude
  ll: string;
  
  // Optional parameters
  query?: string;
  categories?: string;
  radius?: number;
  limit?: number;
  sort?: 'DISTANCE' | 'POPULARITY' | 'RATING';
  fields?: string[];
}

/**
 * Venue location information
 */
export interface VenueLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  neighborhood?: string[];
  formattedAddress?: string;
  crossStreet?: string;
  lat?: number;
  lng?: number;
  // Add FSQ v3 API fields
  locality?: string;
  region?: string;
  formatted_address?: string;
}

/**
 * Venue category
 */
export interface VenueCategory {
  id: string | number;
  name: string;
  icon?: {
    prefix?: string;
    suffix?: string;
  };
  primary?: boolean;
}

/**
 * Venue hours
 */
export interface VenueHours {
  status?: string;
  isOpen?: boolean;
  openNow?: boolean;
  displayHours?: string[];
  regularHours?: {
    days: string;
    open: {
      start: string;
      end: string;
    }[];
  }[];
  // Add FSQ v3 API fields
  display?: string;
  is_local_holiday?: boolean;
  open_now?: boolean;
  regular?: {
    close?: string;
    day?: number;
    open?: string;
  }[];
}

/**
 * Venue photo
 */
export interface VenuePhoto {
  id: string;
  prefix?: string;
  suffix?: string;
  width?: number;
  height?: number;
  created_at?: string;
}

/**
 * Venue price information
 */
export interface VenuePrice {
  tier: number; // 1, 2, 3, or 4
  message: string; // "$", "$$", "$$$", "$$$$"
  currency?: string;
}

/**
 * Venue contact information
 */
export interface VenueContact {
  phone?: string;
  formattedPhone?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  url?: string;
}

/**
 * Menu information
 */
export interface VenueMenu {
  url: string;
  mobileUrl?: string;
  type?: string;
  label?: string;
}

/**
 * A venue/place from Foursquare API
 */
export interface Venue {
  id?: string;
  fsq_id?: string; // FSQ v3 API uses fsq_id
  name: string;
  location?: VenueLocation;
  categories?: VenueCategory[];
  photos?: VenuePhoto[];
  rating?: number;
  ratingColor?: string;
  price?: VenuePrice;
  hours?: VenueHours;
  contact?: VenueContact;
  description?: string;
  url?: string;
  menu?: VenueMenu;
  createdAt?: number;
  verified?: boolean;
  stats?: {
    tipCount?: number;
    usersCount?: number;
    checkinsCount?: number;
  };
  likes?: {
    count?: number;
    summary?: string;
  };
  listed?: {
    count?: number;
    groups?: any[];
  };
  phrases?: {
    phrase?: string;
    count?: number;
  }[];
  attributes?: {
    groups?: {
      type?: string;
      name?: string;
      summary?: string;
      items?: {
        displayName?: string;
        displayValue?: string;
      }[];
    }[];
  };
  distance?: number;
  distances?: number;
  // Add FSQ v3 API fields
  chains?: any[];
  geocodes?: {
    main?: {
      latitude?: number;
      longitude?: number;
    };
  };
  related_places?: any;
  timezone?: string;
  tel?: string;
  website?: string;
}

/**
 * Response from venue search API
 */
export interface VenueSearchResponse {
  results: Venue[];
  context?: {
    geoBounds?: {
      circle?: {
        center?: {
          latitude?: number;
          longitude?: number;
        };
        radius?: number;
      };
    };
  };
  totalResults?: number;
}

/**
 * Response from venue details API
 */
export interface VenueDetailsResponse extends Venue {
  // FSQ v3 API returns the venue directly, not nested under 'venue'
}
