const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the root node_modules
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules['@core'] = path.resolve(workspaceRoot, 'packages/core/src');
// 4. Add alias for core/* to resolve to packages/core/src/*
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  core: path.resolve(workspaceRoot, 'packages/core/src'),
};
console.log('Resolving core to:', path.resolve(workspaceRoot, 'packages/core/src'));

module.exports = config;
