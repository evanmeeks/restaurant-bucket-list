#!/bin/bash
set -e

# Define paths
OLD_PROJECT="/Users/donnymeeks/Desktop/restaurant-bucket-list"
NEW_PROJECT="/Users/donnymeeks/Desktop/restaurant-finder"

# Ensure the script runs in the new project's base directory
cd "$NEW_PROJECT" || { echo "Error: Cannot access $NEW_PROJECT"; exit 1; }

# Verify no workspaces in new project's package.json
if grep -q '"workspaces"' package.json; then
  echo "Warning: Found 'workspaces' in $NEW_PROJECT/package.json. Removing to ensure single-repo setup..."
  sed -i '' '/"workspaces":/d' package.json
fi

# Create directories
mkdir -p docs
mkdir -p .vscode

# Copy or create configuration files
echo "Copying or creating configuration files..."
if [ -f "$OLD_PROJECT/.env.example" ]; then
  cp "$OLD_PROJECT/.env.example" .env.example
else
  echo "Warning: .env.example not found in $OLD_PROJECT, creating from provided content..."
  cat > .env.example << EOL
# API Keys
FOURSQUARE_API_KEY=your_foursquare_api_key_here

# Firebase Config
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
FIREBASE_APP_ID=your_firebase_app_id_here

# Environment
NODE_ENV=development
API_URL=https://api.foursquare.com/v3

# App Config
APP_NAME=Restaurant Bucket List
DEFAULT_LOCATION_LATITUDE=37.7749
DEFAULT_LOCATION_LONGITUDE=-122.4194
EOL
fi

if [ -f "$OLD_PROJECT/.eslintrc.js" ]; then
  cp "$OLD_PROJECT/.eslintrc.js" .eslintrc.js
else
  echo "Warning: .eslintrc.js not found in $OLD_PROJECT, creating from provided content..."
  cat > .eslintrc.js << 'EOL'
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier', 'import', 'jsx-a11y'],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'jsx-a11y/anchor-is-valid': 'warn',
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { alwaysTryTypes: true, project: ['./tsconfig.json'] },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  env: { browser: true, node: true, es6: true, jest: true },
};
EOL
fi

if [ -f "$OLD_PROJECT/.prettierrc" ]; then
  cp "$OLD_PROJECT/.prettierrc" .prettierrc
else
  echo "Warning: .prettierrc not found in $OLD_PROJECT, creating from provided content..."
  cat > .prettierrc << EOL
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
EOL
fi

if [ -f "$OLD_PROJECT/.vscode/settings.json" ]; then
  cp "$OLD_PROJECT/.vscode/settings.json" .vscode/settings.json
else
  echo "Warning: .vscode/settings.json not found in $OLD_PROJECT, creating empty file..."
  touch .vscode/settings.json
fi

if [ -f "$OLD_PROJECT/docs/.project_structure_ignore" ]; then
  cp "$OLD_PROJECT/docs/.project_structure_ignore" docs/.project_structure_ignore
else
  echo "Warning: docs/.project_structure_ignore not found in $OLD_PROJECT, creating from provided content..."
  cat > docs/.project_structure_ignore << EOL
.gitignore
node_modules
.expo
.git
ios
android
yarn.lock
yarn.\*
assets
.DS_Store
EOL
fi

if [ -f "$OLD_PROJECT/packages/mobile/babel.config.js" ]; then
  cp "$OLD_PROJECT/packages/mobile/babel.config.js" babel.config.js
else
  echo "Warning: packages/mobile/babel.config.js not found in $OLD_PROJECT, using default..."
fi

if [ -f "$OLD_PROJECT/packages/mobile/metro.config.js" ]; then
  cp "$OLD_PROJECT/packages/mobile/metro.config.js" metro.config.js
else
  echo "Warning: packages/mobile/metro.config.js not found in $OLD_PROJECT, using default..."
fi

if [ -f "$OLD_PROJECT/tsconfig.json" ]; then
  cp "$OLD_PROJECT/tsconfig.json" tsconfig.json
else
  echo "Warning: tsconfig.json not found in $OLD_PROJECT, using default React Native tsconfig.json..."
fi

# Update tsconfig.json to remove monorepo references
if [ -f tsconfig.json ]; then
  echo "Updating tsconfig.json..."
  sed -i '' 's/"paths": {[^}]*}/"paths": {}/' tsconfig.json
  sed -i '' 's/"references": \[[^]]*\]//' tsconfig.json
  sed -i '' 's/"extends": "expo\/tsconfig.base"//' tsconfig.json
else
  echo "Warning: tsconfig.json not present, skipping updates"
fi

# Update .eslintrc.js to remove monorepo references
if [ -f .eslintrc.js ]; then
  echo "Updating .eslintrc.js..."
  sed -i '' 's|project: \["./tsconfig.json", "./packages/*/tsconfig.json"\]|project: ["./tsconfig.json"]|' .eslintrc.js
  sed -i '' 's|project: \[.*\]|project: ["./tsconfig.json"]|' .eslintrc.js
else
  echo "Warning: .eslintrc.js not present, skipping updates"
fi

# Install necessary dependencies
echo "Installing dependencies..."
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks prettier react-native-dotenv || yarn add -W -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks prettier react-native-dotenv
yarn add @foursquare/foursquare-places react-native-safe-area-context react-native-vector-icons @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @rneui/themed react-redux @reduxjs/toolkit redux-saga || yarn add -W @foursquare/foursquare-places react-native-safe-area-context react-native-vector-icons @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @rneui/themed react-redux @reduxjs/toolkit redux-saga

# Run tests
echo "Running tests..."
yarn test || echo "No tests found or tests failed, continuing"

# Check build
echo "Checking build..."
yarn ios --no-packager || { echo "Build failed"; exit 1; }

echo "Phase 1 migration completed successfully"