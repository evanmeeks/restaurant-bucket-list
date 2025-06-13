import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReduxDebugPanel: React.FC = () => {
  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redux Debug Panel</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  text: {
    color: 'white',
    fontSize: 10,
  },
});

export default ReduxDebugPanel;
