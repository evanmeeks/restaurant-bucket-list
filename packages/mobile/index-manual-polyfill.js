import { AppRegistry } from 'react-native';

// Import React Native polyfills
import 'react-native-gesture-handler';

// Add URL polyfill for React Native
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      if (base) {
        // Simple base URL resolution
        if (url.startsWith('/')) {
          const baseUrl = new URL(base);
          this.href = baseUrl.origin + url;
        } else if (url.startsWith('http')) {
          this.href = url;
        } else {
          const baseUrl = new URL(base);
          this.href = baseUrl.href.replace(/\/$/, '') + '/' + url;
        }
      } else {
        this.href = url;
      }
      
      // Parse the URL
      const match = this.href.match(/^(https?:)\/\/([^:/]+)(:(\d+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/);
      if (match) {
        this.protocol = match[1];
        this.hostname = match[2];
        this.port = match[4] || (this.protocol === 'https:' ? '443' : '80');
        this.pathname = match[5] || '/';
        this.search = match[6] || '';
        this.hash = match[7] || '';
        this.origin = `${this.protocol}//${this.hostname}${this.port !== '80' && this.port !== '443' ? ':' + this.port : ''}`;
      } else {
        // Fallback for relative URLs or simple parsing
        this.protocol = 'https:';
        this.hostname = 'localhost';
        this.port = '443';
        this.pathname = '/';
        this.search = '';
        this.hash = '';
        this.origin = 'https://localhost';
      }
    }
    
    toString() {
      return this.href;
    }
  };
}

// Add URLSearchParams polyfill
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = class URLSearchParams {
    constructor(init) {
      this.params = new Map();
      if (typeof init === 'string') {
        const pairs = init.replace(/^\?/, '').split('&');
        pairs.forEach(pair => {
          if (pair) {
            const [key, value] = pair.split('=');
            this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
          }
        });
      }
    }
    
    get(name) {
      return this.params.get(name) || null;
    }
    
    set(name, value) {
      this.params.set(name, value);
    }
    
    toString() {
      const pairs = [];
      this.params.forEach((value, key) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
  };
}

// Ensure global timer functions are available
if (typeof global.setTimeout === 'undefined') {
  const { setTimeout, clearTimeout, setInterval, clearInterval } = require('react-native');
  global.setTimeout = setTimeout;
  global.clearTimeout = clearTimeout;
  global.setInterval = setInterval;
  global.clearInterval = clearInterval;
}

import App from './App';

// Get the app name from app.json
const appName = 'RestaurantBucketList';

AppRegistry.registerComponent(appName, () => App);
