const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Get the default Expo Metro config
const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages - prioritize mobile's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. CRITICAL: Add alias for core package to prevent Node.js 'core' module conflicts
config.resolver.alias = {
  ...config.resolver.alias,
  // Force 'core' imports to resolve to your local package, not Node.js core modules
  'core': path.resolve(workspaceRoot, 'packages/core/src'),
  'core/src': path.resolve(workspaceRoot, 'packages/core/src'),
};

// 4. Ensure proper platform extensions and TypeScript support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// 5. Fix the transform.routerRoot warning by disabling Expo Router
config.resolver.unstable_enablePackageExports = false;

// 6. Block Node.js core modules from being resolved in React Native
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 7. Blacklist Node.js specific modules that shouldn't be used in React Native
config.resolver.blockList = [
  // Block Node.js core modules
  /node_modules\/core\/lib\/common\/Net\.js$/,
  /node_modules\/core\/lib\/common\/Process\.js$/,
  /.*\/node_modules\/core\/lib\/.*$/,
];

// 8. Add transformer options
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

console.log('Metro Config:');
console.log('- Project Root:', projectRoot);
console.log('- Workspace Root:', workspaceRoot);
console.log('- Core alias resolves to:', path.resolve(workspaceRoot, 'packages/core/src'));
console.log('- Blocked paths:', config.resolver.blockList);

module.exports = config;
