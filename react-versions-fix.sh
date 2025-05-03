#!/bin/bash
# List all React and React Native dependencies
echo "Checking React dependencies in project..."
find . -name "node_modules" -type d -prune -o -name "package.json" -type f -exec grep -l "react\|react-native\|expo" {} \;

# Show the actual versions
echo "Current React versions:"
npm list react react-dom react-native expo