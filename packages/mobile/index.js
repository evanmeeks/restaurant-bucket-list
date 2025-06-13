import { AppRegistry } from 'react-native';

// Import React Native polyfills
import 'react-native-gesture-handler';

// Enhanced URL polyfill specifically for Axios compatibility
if (typeof global.URL === 'undefined') {
  class URLPolyfill {
    constructor(url, base) {
      // Handle base URL resolution
      if (base && !url.match(/^https?:\/\//)) {
        if (url.startsWith('/')) {
          const baseUrl = new URLPolyfill(base);
          url = baseUrl.origin + url;
        } else if (!url.startsWith('http')) {
          url = base.replace(/\/$/, '') + '/' + url;
        }
      }
      
      this.href = url;
      
      // Parse URL components using more robust regex
      const urlRegex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
      const match = this.href.match(urlRegex);
      
      if (match) {
        // Extract components
        this.protocol = match[2] ? match[2] + ':' : 'https:';
        const authority = match[4] || '';
        this.pathname = match[5] || '/';
        this.search = match[6] || '';
        this.hash = match[8] ? '#' + match[8] : '';
        
        // Parse authority (host:port)
        if (authority) {
          const hostPortMatch = authority.match(/^([^:]+)(?::(\d+))?$/);
          if (hostPortMatch) {
            this.hostname = hostPortMatch[1];
            this.port = hostPortMatch[2] || (this.protocol === 'https:' ? '443' : '80');
          } else {
            this.hostname = authority;
            this.port = this.protocol === 'https:' ? '443' : '80';
          }
        } else {
          this.hostname = 'localhost';
          this.port = '443';
        }
        
        // Build derived properties
        this.host = this.port === '443' && this.protocol === 'https:' || 
                   this.port === '80' && this.protocol === 'http:' 
                   ? this.hostname 
                   : `${this.hostname}:${this.port}`;
        
        this.origin = `${this.protocol}//${this.host}`;
        
        // Ensure href is properly formatted
        if (!this.href.startsWith('http')) {
          this.href = `${this.origin}${this.pathname}${this.search}${this.hash}`;
        }
      } else {
        // Fallback values for malformed URLs
        this.protocol = 'https:';
        this.hostname = 'localhost';
        this.host = 'localhost';
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
    
    toJSON() {
      return this.href;
    }
  }
  
  global.URL = URLPolyfill;
  
  // Also add to global scope for compatibility
  global.URL.prototype = URLPolyfill.prototype;
}

// Enhanced URLSearchParams polyfill for Axios
if (typeof global.URLSearchParams === 'undefined') {
  class URLSearchParamsPolyfill {
    constructor(init) {
      this.params = new Map();
      
      if (typeof init === 'string') {
        this._parseString(init);
      } else if (init instanceof URLSearchParamsPolyfill) {
        this.params = new Map(init.params);
      } else if (init && typeof init === 'object') {
        Object.keys(init).forEach(key => {
          this.params.set(key, String(init[key]));
        });
      }
    }
    
    _parseString(str) {
      const search = str.replace(/^\?/, '');
      if (search) {
        const pairs = search.split('&');
        pairs.forEach(pair => {
          const [key, value = ''] = pair.split('=');
          if (key) {
            this.params.set(
              decodeURIComponent(key), 
              decodeURIComponent(value)
            );
          }
        });
      }
    }
    
    get(name) {
      return this.params.get(name) || null;
    }
    
    set(name, value) {
      this.params.set(name, String(value));
    }
    
    has(name) {
      return this.params.has(name);
    }
    
    delete(name) {
      this.params.delete(name);
    }
    
    append(name, value) {
      const existing = this.params.get(name);
      if (existing) {
        this.params.set(name, existing + ',' + String(value));
      } else {
        this.params.set(name, String(value));
      }
    }
    
    toString() {
      const pairs = [];
      this.params.forEach((value, key) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
    
    *[Symbol.iterator]() {
      for (const [key, value] of this.params) {
        yield [key, value];
      }
    }
    
    entries() {
      return this[Symbol.iterator]();
    }
    
    keys() {
      return this.params.keys();
    }
    
    values() {
      return this.params.values();
    }
    
    forEach(callback, thisArg) {
      this.params.forEach(callback, thisArg);
    }
  }
  
  global.URLSearchParams = URLSearchParamsPolyfill;
}

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
