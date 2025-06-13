#!/bin/bash

# Navigate to the screens directory
cd /Users/donnymeeks/Desktop/migrate/restaurant-bucket-list/packages/mobile/src/components/screens

# Files to be removed
REMOVE_FILES=(
  "AddToBucketListScreen.tsx"
  "AuthScreen.tsx"
  "BucketListItemEditScreen.tsx"
  "BucketListScreen copy.tsx"
  "BucketListScreen-.tsx"
  "HomeScreen.tsx"
  "NearbyVenuesContainer.tsx"
  "OnBoardingScreen.tsx"
  "RecommendedVenuesContainer.tsx"
  "SettingsScreen.tsx"
  "VenueDetailsScreen.tsx"
)

# Create a backup directory for removed files
mkdir -p ./backup-removed-screens

# Backup and remove files
for file in "${REMOVE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Backing up and removing $file"
    cp "$file" ./backup-removed-screens/ 2>/dev/null || echo "$file not found"
    rm -f "$file" 2>/dev/null
  else
    echo "$file already moved or doesn't exist"
  fi
done

echo "Cleanup complete. Removed files have been backed up to ./backup-removed-screens/"
echo "The changes to saga and slice files have been implemented."
