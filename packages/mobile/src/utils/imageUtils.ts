import { Venue, VenuePhoto } from 'core/src/models/venue';

/**
 * Utility functions for handling images throughout the app
 */

/**
 * Default fallback image for venues without photos
 */
export const DEFAULT_VENUE_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image+Available';

/**
 * Get the best venue image URL
 * @param venue The venue object
 * @param width Desired image width
 * @param height Desired image height
 * @returns URL of the best suitable image
 */
export const getVenueImage = (
  venue?: Venue | null,
  width: number = 300, 
  height: number = 200
): string => {
  if (!venue || !venue.photos || venue.photos.length === 0) {
    return DEFAULT_VENUE_IMAGE;
  }

  // Use the first photo
  const photo = venue.photos[0];
  return constructPhotoUrl(photo, width, height);
};

/**
 * Get all venue images
 * @param venue The venue object
 * @param width Desired image width
 * @param height Desired image height
 * @returns Array of image URLs
 */
export const getVenueImages = (
  venue?: Venue | null,
  width: number = 300,
  height: number = 200
): string[] => {
  if (!venue || !venue.photos || venue.photos.length === 0) {
    return [DEFAULT_VENUE_IMAGE];
  }

  return venue.photos.map(photo => constructPhotoUrl(photo, width, height));
};

/**
 * Construct a photo URL from Foursquare photo object
 * @param photo The photo object
 * @param width Desired image width
 * @param height Desired image height
 * @returns Constructed image URL
 */
export const constructPhotoUrl = (
  photo: VenuePhoto,
  width: number = 300,
  height: number = 200
): string => {
  return `${photo.prefix}${width}x${height}${photo.suffix}`;
};

/**
 * Get a category icon URL
 * @param category The category object
 * @param size Desired icon size
 * @returns Category icon URL
 */
export const getCategoryIcon = (
  category: { icon?: { prefix?: string; suffix?: string } },
  size: number = 64
): string | undefined => {
  if (!category.icon || !category.icon.prefix || !category.icon.suffix) {
    return undefined;
  }

  return `${category.icon.prefix}${size}${category.icon.suffix}`;
};

/**
 * Get a placeholder image with custom text
 * @param text Custom text for the placeholder
 * @param width Image width
 * @param height Image height
 * @returns Placeholder image URL
 */
export const getPlaceholderImage = (
  text: string = 'No Image',
  width: number = 300,
  height: number = 200
): string => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}?text=${encodedText}`;
};

/**
 * Convert a photo URL to a lower resolution for thumbnails
 * @param url Original image URL
 * @param size Desired thumbnail size
 * @returns Thumbnail URL
 */
export const getThumbnailUrl = (url: string, size: number = 100): string => {
  // If it's a placeholder, adjust the dimensions
  if (url.includes('via.placeholder.com')) {
    return url.replace(/(\d+)x(\d+)/, `${size}x${size}`);
  }

  // For Foursquare photos, construct a new URL with smaller dimensions
  if (url.includes('.foursquare.com')) {
    // Extract prefix and suffix
    const match = url.match(/(.+)(\d+)x(\d+)(.+)/);
    if (match) {
      const [, prefix, , , suffix] = match;
      return `${prefix}${size}x${size}${suffix}`;
    }
  }

  // Return original URL if we can't create a thumbnail
  return url;
};
