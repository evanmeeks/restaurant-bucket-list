#!/bin/bash

echo "🧹 Cleaning iOS build and fixing Flipper issues..."

# Navigate to the mobile package directory
cd "$(dirname "$0")"

echo "📱 Current directory: $(pwd)"

# Clean iOS build
echo "🗑️  Cleaning iOS build directory..."
rm -rf ios/build

# Clean node modules and reinstall
echo "📦 Cleaning and reinstalling dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
npm install

# Clean iOS pods
echo "🍎 Cleaning CocoaPods..."
cd ios
rm -rf Pods
rm -f Podfile.lock

# Install pods
echo "📲 Installing CocoaPods..."
pod deintegrate
pod cache clean --all
pod install

echo "✅ Cleanup complete! Now try running: npx expo run:ios"
