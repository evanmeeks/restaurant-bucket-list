#!/bin/bash

# Restaurant Bucket List Migration Script
# This script migrates the app from a monorepo structure to a standalone Expo app

# Set paths
SOURCE_DIR="/Users/donnymeeks/Desktop/restaurant-bucket-list"
TARGET_DIR="/Users/donnymeeks/SimpleRestaurantApp"

# Colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting migration from ${SOURCE_DIR} to ${TARGET_DIR}${NC}"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo -e "${RED}Error: Source directory does not exist.${NC}"
  exit 1
fi

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${RED}Error: Target directory does not exist.${NC}"
  exit 1
fi

# Function to create directory if it doesn't exist
create_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    echo -e "${GREEN}Created directory: $1${NC}"
  fi
}

# Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
create_dir "$TARGET_DIR/src"
create_dir "$TARGET_DIR/src/api"
create_dir "$TARGET_DIR/src/components"
create_dir "$TARGET_DIR/src/components/common"
create_dir "$TARGET_DIR/src/components/forms"
create_dir "$TARGET_DIR/src/components/screens"
create_dir "$TARGET_DIR/src/constants"
create_dir "$TARGET_DIR/src/models"
create_dir "$TARGET_DIR/src/navigation"
create_dir "$TARGET_DIR/src/store"
create_dir "$TARGET_DIR/src/store/slices"
create_dir "$TARGET_DIR/src/store/sagas"
create_dir "$TARGET_DIR/src/theme"
create_dir "$TARGET_DIR/src/utils"
create_dir "$TARGET_DIR/assets"

# Copy environment file
if [ -f "$SOURCE_DIR/.env" ]; then
  cp "$SOURCE_DIR/.env" "$TARGET_DIR/.env"
  echo -e "${GREEN}Copied .env file${NC}"
fi

# Copy .env.example if it exists
if [ -f "$SOURCE_DIR/.env.example" ]; then
  cp "$SOURCE_DIR/.env.example" "$TARGET_DIR/.env.example"
  echo -e "${GREEN}Copied .env.example file${NC}"
fi

# Copy assets
echo -e "${YELLOW}Copying assets...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/assets" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/assets/"* "$TARGET_DIR/assets/"
  echo -e "${GREEN}Copied assets${NC}"
fi

# Copy model files
echo -e "${YELLOW}Copying model files...${NC}"
if [ -d "$SOURCE_DIR/packages/core/src/models" ]; then
  cp -r "$SOURCE_DIR/packages/core/src/models/"* "$TARGET_DIR/src/models/"
  echo -e "${GREEN}Copied model files${NC}"
fi

# Copy API files (with fixes)
echo -e "${YELLOW}Copying and fixing API files...${NC}"
if [ -d "$SOURCE_DIR/packages/core/src/api" ]; then
  # Copy all API files
  cp -r "$SOURCE_DIR/packages/core/src/api/"* "$TARGET_DIR/src/api/"

  # Fix the foursquare.ts file to ensure correct imports
  if [ -f "$TARGET_DIR/src/api/foursquare.ts" ]; then
    # Create a temporary file for sed operations
    sed -i '' 's/import { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET, FOURSQUARE_API_KEY } from ..\\/utils\\/env/import { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET, FOURSQUARE_API_KEY } from "@env"/' "$TARGET_DIR/src/api/foursquare.ts"

    echo -e "${GREEN}Fixed API files${NC}"
  fi
fi

# Create env.ts utility file
echo -e "${YELLOW}Creating environment utility file...${NC}"
cat > "$TARGET_DIR/src/utils/env.ts" << 'EOL'
// Import environment variables directly
import { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET, FOURSQUARE_API_KEY } from '@env';

// Export environment variables as constants for better TypeScript support
export { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET, FOURSQUARE_API_KEY };
EOL
echo -e "${GREEN}Created environment utility file${NC}"

# Create TypeScript declaration file for environment variables
echo -e "${YELLOW}Creating TypeScript declaration file for environment variables...${NC}"
cat > "$TARGET_DIR/env.d.ts" << 'EOL'
declare module '@env' {
  export const FOURSQUARE_CLIENT_ID: string;
  export const FOURSQUARE_CLIENT_SECRET: string;
  export const FOURSQUARE_API_KEY: string;
}
EOL
echo -e "${GREEN}Created TypeScript declaration file for environment variables${NC}"

# Copy Redux store files with fixes
echo -e "${YELLOW}Copying and fixing Redux store files...${NC}"

# Copy slices with appropriate fixes
if [ -d "$SOURCE_DIR/packages/core/src/store/slices" ]; then
  cp -r "$SOURCE_DIR/packages/core/src/store/slices/"* "$TARGET_DIR/src/store/slices/"
  echo -e "${GREEN}Copied Redux slice files${NC}"
fi

# Create fixed venue saga file to avoid the takeLatest issue
echo -e "${YELLOW}Creating fixed venuesSaga.ts file...${NC}"
cat > "$TARGET_DIR/src/store/sagas/venuesSaga.ts" << 'EOL'
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';

import { foursquareService } from '../../api/foursquare';
import {
  fetchNearbyVenues,
  fetchNearbyVenuesSuccess,
  fetchNearbyVenuesFailure,
  fetchRecommendedVenues,
  fetchRecommendedVenuesSuccess,
  fetchRecommendedVenuesFailure,
  searchVenues,
  searchVenuesSuccess,
  searchVenuesFailure,
  selectVenue,
  setSelectedVenue,
} from '../slices/venuesSlice';
import { Coordinates, Venue } from '../../models/venue';
import { RootState } from '../index';

// Handle fetch nearby venues
function* handleFetchNearbyVenues(
  action: PayloadAction<{
    coordinates: Coordinates;
    radius?: number;
    categories?: string[];
  }>
) {
  try {
    if (!action || !action.payload) {
      console.error('Invalid action or payload in handleFetchNearbyVenues');
      return;
    }
    const { coordinates, radius = 1000, categories } = action.payload;

    // Call API
    const response = yield call(
      foursquareService.searchNearbyVenues.bind(foursquareService),
      coordinates,
      undefined, // No query for nearby venues
      categories,
      radius
    );

    // Handle success
    yield put(fetchNearbyVenuesSuccess(response.results));
  } catch (error: any) {
    console.error('Failed to fetch nearby venues:', error);
    yield put(fetchNearbyVenuesFailure(error.message || 'Failed to fetch nearby venues'));
  }
}

// Handle fetch recommended venues
function* handleFetchRecommendedVenues(
  action: PayloadAction<{
    coordinates: Coordinates;
    limit?: number;
  }>
) {
  try {
    if (!action || !action.payload) {
      console.error('Invalid action or payload in handleFetchRecommendedVenues');
      return;
    }

    const { coordinates, limit = 10 } = action.payload;

    // Call API
    const response = yield call(
      foursquareService.getRecommendedVenues.bind(foursquareService),
      coordinates,
      limit
    );

    // Handle success
    yield put(fetchRecommendedVenuesSuccess(response.results));
  } catch (error: any) {
    console.error('Failed to fetch recommended venues:', error);
    yield put(fetchRecommendedVenuesFailure(error.message || 'Failed to fetch recommended venues'));
  }
}

// Handle search venues
function* handleSearchVenues(
  action: PayloadAction<{
    coordinates: Coordinates;
    query: string;
    categories?: string[];
    radius?: number;
  }>
) {
  try {
    if (!action || !action.payload) {
      console.error('Invalid action or payload in handleSearchVenues');
      return;
    }

    const { coordinates, query, categories, radius = 2000 } = action.payload;

    // Call API
    const response = yield call(
      foursquareService.searchNearbyVenues.bind(foursquareService),
      coordinates,
      query,
      categories,
      radius
    );
    // Handle success
    yield put(searchVenuesSuccess(response.results));
  } catch (error: any) {
    console.error('Failed to search venues:', error);
    yield put(searchVenuesFailure(error.message || 'Failed to search venues'));
  }
}

// Handle select venue
function* handleSelectVenue(action: PayloadAction<string>) {
  try {
    if (!action || !action.payload) {
      console.error('Invalid action or payload in handleSelectVenue');
      return;
    }

    const venueId = action.payload;

    // Check if venue is already in state
    const state: RootState = yield select();
    let venue: Venue | undefined;

    // Look for venue in all lists
    venue = state.venues.nearby.venues.find(v => v.id === venueId);
    if (!venue) venue = state.venues.recommended.venues.find(v => v.id === venueId);
    if (!venue) venue = state.venues.search.venues.find(v => v.id === venueId);

    if (venue) {
      // If venue is already in state, use it
      yield put(setSelectedVenue(venue));
    } else {
      // Otherwise fetch from API
      const response = yield call(
        foursquareService.getVenueDetails.bind(foursquareService),
        venueId
      );

      // Handle success
      yield put(setSelectedVenue(response.venue));
    }
  } catch (error: any) {
    console.error('Failed to get venue details:', error);
    // You could add a specific failure action here if needed
  }
}

// Watch for venue actions
export function* watchVenues() {
  yield takeLatest(fetchNearbyVenues.type, handleFetchNearbyVenues);
  yield takeLatest(fetchRecommendedVenues.type, handleFetchRecommendedVenues);
  yield takeLatest(searchVenues.type, handleSearchVenues);
  yield takeLatest(selectVenue.type, handleSelectVenue);
}
EOL
echo -e "${GREEN}Created fixed venuesSaga.ts file${NC}"

# Copy other saga files
if [ -d "$SOURCE_DIR/packages/core/src/store/sagas" ]; then
  # Copy all sagas except venuesSaga.ts (which we just fixed)
  find "$SOURCE_DIR/packages/core/src/store/sagas" -type f -name "*.ts" -not -name "venuesSaga.ts" -exec cp {} "$TARGET_DIR/src/store/sagas/" \;
  echo -e "${GREEN}Copied other saga files${NC}"
fi

# Create store index file
echo -e "${YELLOW}Creating store index file...${NC}"
cat > "$TARGET_DIR/src/store/index.ts" << 'EOL'
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

// Import reducers
import venuesReducer from './slices/venuesSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import bucketListReducer from './slices/bucketListSlice';

// Import sagas
import { watchVenues } from './sagas/venuesSaga';
import { watchAuth } from './sagas/authSaga';
import { watchBucketList } from './sagas/bucketListSaga';
import { watchLocation } from './sagas/locationSaga';

// Configure redux-persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'bucketList', 'ui'], // Only persist these reducers
};

// Combine all reducers
const rootReducer = {
  venues: venuesReducer,
  ui: uiReducer,
  auth: authReducer,
  bucketList: bucketListReducer,
};

// Root saga
function* rootSaga() {
  yield all([
    watchVenues(),
    watchAuth(),
    watchBucketList(),
    watchLocation(),
  ]);
}

// Setup saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
      thunk: false,
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for use in components
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
EOL
echo -e "${GREEN}Created store index file${NC}"

# Copy navigation files
echo -e "${YELLOW}Copying and fixing navigation files...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/navigation" ]; then
  # Copy all navigation files
  cp -r "$SOURCE_DIR/packages/mobile/src/navigation/"* "$TARGET_DIR/src/navigation/"

  # Fix the imports in MainNavigator.tsx
  if [ -f "$TARGET_DIR/src/navigation/MainNavigator.tsx" ]; then
    # Fix import paths
    sed -i '' 's/import { useAppSelector } from .core\/src\/store./import { useAppSelector } from ..\/store./' "$TARGET_DIR/src/navigation/MainNavigator.tsx"

    # Fix export
    sed -i '' 's/export const MainNavigator/const MainNavigator/' "$TARGET_DIR/src/navigation/MainNavigator.tsx"

    echo -e "${GREEN}Fixed MainNavigator.tsx${NC}"
  fi

  echo -e "${GREEN}Copied navigation files${NC}"
fi

# Copy theme files
echo -e "${YELLOW}Copying theme files...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/theme" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/src/theme/"* "$TARGET_DIR/src/theme/"
  echo -e "${GREEN}Copied theme files${NC}"
elif [ -d "$SOURCE_DIR/packages/mobile/theme" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/theme/"* "$TARGET_DIR/src/theme/"
  echo -e "${GREEN}Copied theme files${NC}"
fi

# Copy screen components
echo -e "${YELLOW}Copying screen components...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/components/screens" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/src/components/screens/"* "$TARGET_DIR/src/components/screens/"
  echo -e "${GREEN}Copied screen components${NC}"
fi

# Copy common components
echo -e "${YELLOW}Copying common components...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/components/common" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/src/components/common/"* "$TARGET_DIR/src/components/common/"
  echo -e "${GREEN}Copied common components${NC}"
fi

# Copy form components
echo -e "${YELLOW}Copying form components...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/components/forms" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/src/components/forms/"* "$TARGET_DIR/src/components/forms/"
  echo -e "${GREEN}Copied form components${NC}"
fi

# Copy utility files
echo -e "${YELLOW}Copying utility files...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/utils" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/src/utils/"* "$TARGET_DIR/src/utils/"
  echo -e "${GREEN}Copied utility files${NC}"
fi

# Copy constant files
echo -e "${YELLOW}Copying constant files...${NC}"
if [ -d "$SOURCE_DIR/packages/mobile/src/constants" ]; then
  cp -r "$SOURCE_DIR/packages/mobile/src/constants/"* "$TARGET_DIR/src/constants/"
  echo -e "${GREEN}Copied constant files${NC}"
elif [ -d "$SOURCE_DIR/packages/constants" ]; then
  cp -r "$SOURCE_DIR/packages/constants/"* "$TARGET_DIR/src/constants/"
  echo -e "${GREEN}Copied constant files${NC}"
fi

# Create App.tsx
echo -e "${YELLOW}Creating App.tsx...${NC}"
cat > "$TARGET_DIR/App.tsx" << 'EOL'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';

import { store, persistor } from './src/store';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <MainNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
EOL
echo -e "${GREEN}Created App.tsx${NC}"

# Create index.js
echo -e "${YELLOW}Creating index.js...${NC}"
cat > "$TARGET_DIR/index.js" << 'EOL'
import { registerRootComponent } from 'expo';
import App from './App';

// Register the app
registerRootComponent(App);
EOL
echo -e "${GREEN}Created index.js${NC}"

# Create app.json
echo -e "${YELLOW}Creating app.json...${NC}"
cat > "$TARGET_DIR/app.json" << 'EOL'
{
  "expo": {
    "name": "RestaurantBucketList",
    "slug": "restaurant-bucket-list",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.restaurantbucketlist"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.restaurantbucketlist"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOL
echo -e "${GREEN}Created app.json${NC}"

# Create babel.config.js
echo -e "${YELLOW}Creating babel.config.js...${NC}"
cat > "$TARGET_DIR/babel.config.js" << 'EOL'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
      'react-native-reanimated/plugin'
    ],
  };
};
EOL
echo -e "${GREEN}Created babel.config.js${NC}"

# Create tsconfig.json
echo -e "${YELLOW}Creating tsconfig.json...${NC}"
cat > "$TARGET_DIR/tsconfig.json" << 'EOL'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "*": ["*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/components/screens/*"],
      "@navigation/*": ["src/navigation/*"],
      "@store/*": ["src/store/*"],
      "@utils/*": ["src/utils/*"],
      "@theme/*": ["src/theme/*"],
      "@api/*": ["src/api/*"],
      "@models/*": ["src/models/*"],
      "@constants/*": ["src/constants/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
EOL
echo -e "${GREEN}Created tsconfig.json${NC}"

# Update package.json to include all dependencies
echo -e "${YELLOW}Updating package.json...${NC}"
cat > "$TARGET_DIR/package.json" << 'EOL'
{
  "name": "restaurant-bucket-list",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@foursquare/foursquare-places": "^1.0.3",
    "@react-native-async-storage/async-storage": "^1.19.3",
    "@react-navigation/bottom-tabs": "^6.5.8",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "@reduxjs/toolkit": "^1.9.5",
    "@rneui/base": "^4.0.0-rc.7",
    "@rneui/themed": "^4.0.0-rc.7",
    "axios": "^1.5.0",
    "expo": "~49.0.13",
    "expo-constants": "~14.4.2",
    "expo-linking": "~5.0.2",
    "expo-location": "~16.1.0",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.5",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-maps": "1.7.1",
    "react-native-reanimated": "~3.3.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "react-native-vector-icons": "^10.0.0",
    "react-redux": "^8.1.2",
    "redux": "^4.2.1",
    "redux-persist": "^6.0.0",
    "redux-saga": "^1.2.3"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.14",
    "react-native-dotenv": "^3.4.9",
    "typescript": "^5.1.3"
  },
  "private": true
}
EOL
echo -e "${GREEN}Updated package.json${NC}"

# Update .env file or create it if it doesn't exist
if [ ! -f "$TARGET_DIR/.env" ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cat > "$TARGET_DIR/.env" << 'EOL'
FOURSQUARE_CLIENT_ID=your_client_id_here
FOURSQUARE_CLIENT_SECRET=your_client_secret_here
FOURSQUARE_API_KEY=your_api_key_here
EOL
  echo -e "${GREEN}Created .env file${NC}"
else
  echo -e "${GREEN}.env file already exists${NC}"
fi

# Create metro.config.js with optimized configuration
echo -e "${YELLOW}Creating metro.config.js...${NC}"
cat > "$TARGET_DIR/metro.config.js" << 'EOL'
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolution for querystring module
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  querystring: require.resolve('querystring-es3'),
  stream: require.resolve('stream-browserify'),
  path: require.resolve('path-browserify'),
};

// Add source extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

module.exports