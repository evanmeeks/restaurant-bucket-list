// Temporary development configuration
export const FOURSQUARE_CLIENT_ID = 'dev-client-id';
export const FOURSQUARE_CLIENT_SECRET = 'dev-client-secret';
export const FOURSQUARE_API_KEY = 'dev-api-key';

export const validateFoursquareConfig = () => {
  console.log('Using development Foursquare config');
  return true;
};

export default {
  FOURSQUARE_CLIENT_ID,
  FOURSQUARE_CLIENT_SECRET,
  FOURSQUARE_API_KEY,
  validateFoursquareConfig,
};
