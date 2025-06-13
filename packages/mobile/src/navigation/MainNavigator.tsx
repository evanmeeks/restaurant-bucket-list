import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';
import React from 'react';
import { Platform } from 'react-native';
import { theme } from '../theme';

// Import screens
import { BucketListScreen } from '../components/screens/BucketListScreen';
import { ExploreScreen } from '../components/screens/ExploreScreen';
import { ProfileScreen } from '../components/screens/ProfileScreen';
import { SearchScreen } from '../components/screens/SearchScreen';
import { APITestScreen } from '../components/screens/APITestScreen';
import DetailScreen from '../components/screens/DetailScreen';

// Import types
import { MainTabParamList, RootStackParamList } from './types';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Bottom Tab Navigator
 * - Provides the main navigation tabs for the app
 * - Includes icons and labels for each tab
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.grey3,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          paddingVertical: Platform.OS === 'ios' ? 10 : 5,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="explore" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BucketList"
        component={BucketListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookmark" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="APITest"
        component={APITestScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="code" type="material" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Stack Navigator
 * - Wraps the tab navigator
 * - Provides screens that should appear on top of the tabs
 */
const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
