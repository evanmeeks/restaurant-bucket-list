#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running tests for Foursquare API integration...${NC}"

# Run individual test files
echo -e "\n${YELLOW}Testing foursquareAdapter.test.ts...${NC}"
yarn jest src/api/__tests__/foursquareAdapter.test.ts

echo -e "\n${YELLOW}Testing foursquareV3.test.ts...${NC}"
yarn jest src/api/__tests__/foursquareV3.test.ts

echo -e "\n${YELLOW}Testing foursquare.test.ts...${NC}"
yarn jest src/api/__tests__/foursquare.test.ts

echo -e "\n${YELLOW}Testing venuesSaga.improved.test.ts...${NC}"
yarn jest src/store/sagas/__tests__/venuesSaga.improved.test.ts

echo -e "\n${YELLOW}Testing useGeolocation.test.ts...${NC}"
yarn jest src/hooks/__tests__/useGeolocation.test.ts

# Run all tests and calculate coverage
echo -e "\n${YELLOW}Running all tests with coverage...${NC}"
yarn test:coverage

# Check if all tests passed
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed successfully!${NC}"
else
  echo -e "\n${RED}Some tests failed. Please check the output above for details.${NC}"
fi
