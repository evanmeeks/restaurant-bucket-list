import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Simple test screens to isolate the issue
const TestScreen1 = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Test Screen 1</Text>
  </View>
);

const TestScreen2 = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Test Screen 2</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Test1" component={TestScreen1} />
      <Tab.Screen name="Test2" component={TestScreen2} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  text: {
    fontSize: 18,
    color: '#333333',
  },
});

export default RootNavigator;
