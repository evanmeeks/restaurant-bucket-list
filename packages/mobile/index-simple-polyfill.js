import { AppRegistry } from 'react-native';

// Import React Native polyfills
import 'react-native-gesture-handler';

// Import URL polyfill FIRST - this is critical
import 'react-native-url-polyfill/auto';

// Ensure global timer functions are available
if (typeof global.setTimeout === 'undefined') {
  global.setTimeout = (callback, delay) => {
    const start = Date.now();
    const checkTime = () => {
      if (Date.now() - start >= delay) {
        callback();
      } else {
        setImmediate(checkTime);
      }
    };
    setImmediate(checkTime);
  };

  global.clearTimeout = () => {
    // Basic implementation
  };

  global.setInterval = (callback, delay) => {
    const intervalId = { cleared: false };
    const runInterval = () => {
      if (!intervalId.cleared) {
        callback();
        global.setTimeout(runInterval, delay);
      }
    };
    global.setTimeout(runInterval, delay);
    return intervalId;
  };

  global.clearInterval = intervalId => {
    if (intervalId) {
      intervalId.cleared = true;
    }
  };
}

import App from './App';

// Get the app name from iOS AppDelegate
const appName = 'main';

AppRegistry.registerComponent(appName, () => App);
