# Restaurant Bucket List

[![React Native](https://img.shields.io/badge/React%20Native-0.73.6-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-4.2.1-purple.svg)](https://redux.js.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-1.9.5-purple.svg)](https://redux-toolkit.js.org/)
[![Redux Saga](https://img.shields.io/badge/Redux%20Saga-1.2.3-purple.svg)](https://redux-saga.js.org/)
[![Yarn Workspaces](https://img.shields.io/badge/Yarn%20Workspaces-Enabled-brightgreen.svg)](https://yarnpkg.com/features/workspaces)

A cross-platform application (React Native for mobile, React for web) that allows users to discover, save, and track restaurants they want to visit. The app uses geolocation to find nearby restaurants through the Foursquare API and allows users to create a personal "bucket list" of places to try.

## 🌟 Features

- **Cross-Platform**: Build once, deploy to both mobile (iOS & Android) and web
- **Geolocation**: Find restaurants near your current location
- **Foursquare Integration**: Access detailed venue information
- **Restaurant Bucket List**: Save restaurants you want to visit
- **Visit Tracking**: Mark restaurants as visited and leave ratings/reviews
- **Offline Support**: Access your bucket list even without internet
- **ADA Compliance**: Fully accessible interface
- **Dark Mode**: Support for light and dark themes
- **Robust Architecture**: Clean architecture with separated business logic

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- Yarn 1.22 or higher
- For iOS: Xcode 14 or higher & CocoaPods
- For Android: Android Studio & Android SDK
- Foursquare API Key (sign up at [Foursquare Developer](https://developer.foursquare.com/))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/restaurant-bucket-list.git
   cd restaurant-bucket-list
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   ```bash
   # Create .env file in project root
   cp .env.example .env
   # Edit .env file with your API keys
   ```

4. Start the development server:

   ```bash
   # For web
   yarn web:start

   # For iOS
   yarn ios:pod-install  # Only needed on first run or when native dependencies change
   yarn ios

   # For Android
   yarn android
   ```

## 📱 Mobile Development

### iOS

```bash
cd packages/mobile
yarn ios
```

### Android

```bash
cd packages/mobile
yarn android
```

## 🖥️ Web Development

```bash
cd packages/web
yarn start
```

The web app will be available at http://localhost:3000.

## 🧪 Testing

```bash
# Run all tests
yarn test

# Test specific package
yarn workspace core test
yarn workspace mobile test
yarn workspace web test

# Run tests with coverage
yarn test --coverage
```

## API

```
fetch('https://api.foursquare.com/v3/places/search?query=burger&ll=41.8781%2C-87.6298', {
  headers: {
    accept: 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    authorization: 'fsq36FEPfDna8FEIc6x4QcQ3Kl+DsUIZ+goGfv1jqdtplbs=',
    priority: 'u=1, i',
    'Access-Control-Allow-Origin': '*',
  },
  referrer: 'https://docs.foursquare.com/',
  referrerPolicy: 'strict-origin-when-cross-origin',
  body: null,
  method: 'GET',
  mode: 'cors',
  credentials: 'include',
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## 🏗️ Project Structure

```
/
├── packages/                      # Monorepo structure using Yarn Workspaces
│   ├── core/                      # Shared code between mobile and web
│   │   ├── src/
│   │   │   ├── api/               # API services
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── models/            # TypeScript interfaces/types
│   │   │   ├── store/             # Redux store configuration
│   │   │   │   ├── slices/        # Redux Toolkit slices
│   │   │   │   ├── sagas/         # Redux Sagas
│   │   │   │   └── index.ts
│   │   │   └── utils/             # Utility functions
│   │   └── package.json
│   │
│   ├── mobile/                    # React Native mobile app
│   │   ├── android/
│   │   ├── ios/
│   │   ├── src/
│   │   │   ├── components/        # React Native components
│   │   │   │   ├── common/        # Shared components
│   │   │   │   └── screens/       # Screen components
│   │   │   ├── navigation/        # React Navigation setup
│   │   │   ├── services/          # Mobile-specific services
│   │   │   └── theme/             # Styling themes
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── web/                       # React web app
│       ├── public/
│       ├── src/
│       │   ├── components/        # React components
│       │   │   ├── common/        # Shared components
│       │   │   └── pages/         # Page components
│       │   ├── routes/            # React Router setup
│       │   ├── services/          # Web-specific services
│       │   └── theme/             # Styling themes
│       ├── App.tsx
│       └── package.json
│
├── .github/                       # GitHub Actions workflows
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── jest.config.js                 # Jest configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Root package.json for workspaces
└── README.md                      # Project documentation
```

## Current State

This project is currently a basic scaffold with the following implemented:

- Basic project structure following monorepo pattern with Yarn workspaces
- Core package with basic Redux store setup
- Mobile app with React Navigation and stub screen components
- Web app with React Router and stub page components

The next steps will be to implement the actual features by incorporating code from the original project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
