import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../../hooks/redux';

/**
 * Simple test component to verify Redux hooks are working
 */
const HooksTestComponent: React.FC = () => {
  try {
    const items = useAppSelector(state => state.bucketList.items);
    const loading = useAppSelector(state => state.bucketList.loading);

    return (
      <View style={styles.container}>
        <Text style={styles.text}>✅ Redux hooks working!</Text>
        <Text style={styles.text}>Items: {items.length}</Text>
        <Text style={styles.text}>Loading: {loading ? 'Yes' : 'No'}</Text>
      </View>
    );
  } catch (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Hook Error: {error.message}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
    maxWidth: 200,
  },
  text: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 10,
  },
});

export default HooksTestComponent;
