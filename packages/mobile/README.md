# Restaurant Bucket List - Mobile App

This is the React Native mobile app for the Restaurant Bucket List project. It allows users to discover and save restaurants they want to visit.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Yarn
- Expo CLI
- iOS Simulator or Android Emulator (or a physical device with Expo Go app)

### Installation

1. Install dependencies:

```bash
# From the root directory
yarn install
```

### Running the App

```bash
# From the root directory
yarn mobile:start

# Or from this directory
yarn start
```

Then follow the instructions in the terminal to run the app on your desired platform:

- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with your physical device using the Expo Go app

## Testing

The app uses Jest and React Native Testing Library for unit and integration tests. MSW (Mock Service Worker) is used to mock API calls.

### Running Tests

```bash
# From the root directory
yarn test

# Or from this directory
yarn test
```

### Running Tests with Coverage

```bash
# From this directory
yarn test --coverage
```

## Project Structure

```
mobile/
  ├── src/                 # Source code
  │   ├── components/      # Reusable components
  │   ├── screens/         # Screen components
  │   ├── navigation/      # Navigation configuration
  │   └── __tests__/       # Test files
  ├── mocks/               # MSW (Mock Service Worker) configuration
  ├── assets/              # Images, fonts, etc.
  ├── app.json             # Expo configuration
  ├── babel.config.js      # Babel configuration
  ├── jest.config.js       # Jest configuration
  └── tsconfig.json        # TypeScript configuration
```

## Architecture Approach

This app is part of a monorepo architecture that includes:

1. **Core package**: Contains shared business logic, API services, and state management
2. **Mobile package**: React Native mobile app (this package)
3. **Web package**: React web app

The mobile app imports services and models from the core package for a consistent codebase across platforms.

## Testing Strategy

Tests are organized in a few different ways:

1. **Co-located tests**: For simple components, tests are placed in `__tests__` directories next to the component files.
2. **Integration tests**: More complex tests that involve multiple components are placed in dedicated test directories.
3. **API mocking**: MSW is used to mock API responses in tests and during development.
