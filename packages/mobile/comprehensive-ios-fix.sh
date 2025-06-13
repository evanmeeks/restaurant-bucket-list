#!/bin/bash

echo "🧹 Comprehensive iOS Build Fix for Flipper Issues"
echo "================================================="

# Navigate to the mobile package directory
cd "$(dirname "$0")"
echo "📱 Working directory: $(pwd)"

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Clean React Native cache
echo ""
echo "🗑️  Step 1: Cleaning React Native cache..."
npx react-native clean
check_success "React Native clean"

# Clean iOS build directory
echo ""
echo "🗑️  Step 2: Cleaning iOS build directory..."
rm -rf ios/build
check_success "iOS build directory cleanup"

# Clean node modules and package locks
echo ""
echo "📦 Step 3: Cleaning node modules..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
check_success "Node modules cleanup"

# Reinstall dependencies
echo ""
echo "📦 Step 4: Reinstalling dependencies..."
npm install
check_success "NPM install"

# Navigate to iOS directory
echo ""
echo "🍎 Step 5: Working on iOS dependencies..."
cd ios

# Clean CocoaPods completely
echo "   🗑️  Cleaning CocoaPods..."
rm -rf Pods
rm -f Podfile.lock
check_success "CocoaPods cleanup"

# Deintegrate pods (this removes Xcode project references)
echo "   🔧 Deintegrating CocoaPods..."
pod deintegrate
check_success "Pod deintegrate"

# Clear CocoaPods cache
echo "   🧹 Clearing CocoaPods cache..."
pod cache clean --all
check_success "Pod cache clean"

# Install pods fresh
echo "   📲 Installing CocoaPods fresh..."
pod install
check_success "Pod install"

# Go back to mobile directory
cd ..

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo "✅ React Native cache cleared"
echo "✅ iOS build directory cleaned"
echo "✅ Node modules reinstalled"
echo "✅ CocoaPods completely refreshed"
echo "✅ Flipper dependencies excluded via react-native.config.js"
echo ""
echo "Now try running:"
echo "  npx expo run:ios"
echo ""
echo "If you still get Flipper errors, also try:"
echo "  npx expo run:ios --clean"
