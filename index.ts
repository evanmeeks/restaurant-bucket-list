import { AppRegistry } from 'react-native';

import App from './App';

// Get the app name from app.json or use a hardcoded name
const appName = 'RestaurantBucketList'; // Make sure this matches what's in app.json

AppRegistry.registerComponent(appName, () => App);
