cd /Users/donnymeeks/Desktop/migrate/restaurant-bucket-list/packages/mobile

npx react-native clean
rm -rf ios/build
rm -rf node_modules
yarn

cd ios
rm -rf Pods
rm -f Podfile.lock
pod install
cd ..
npx expo start --clear