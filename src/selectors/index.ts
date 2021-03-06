export const getAllSeafoodRestaurants = state => {
  if (areRestaurantsLoaded(state)) {
    return state.restaurantsReducer.restaurants;
  }
  return null;
};

export const getCurrentLocation = state => {
  if (areRestaurantsLoaded(state)) {
    return state.restaurantsReducer.restaurants;
  }
  return null;
};

export const getAllRestaurants = state => {
  if (areRestaurantsLoaded(state)) {
    return state.restaurantsReducer.restaurants;
  }
  return null;
};

export const getCurrentRestaurant = state => {
  if (areRestaurantsLoaded(state)) {
    return state.restaurantsReducer.restaurants[state.restaurantsReducer.restaurant];
  }
  return null;
};

export const locationRetrieved = state => {
  return state.locationReducer.success;
};

export const areRestaurantsLoaded = state => {
  return state.restaurantsReducer.success;
};
