import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// Define root stack param list
export type RootStackParamList = {
  Main: undefined;
  Details: { id: string };
};

// Define bottom tab param list
export type MainTabParamList = {
  Explore: undefined;
  Home: undefined;
  Search: undefined;
  BucketList: undefined;
  Profile: undefined;
};

// Define combined navigation types
export type ExploreNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Explore'>,
  StackNavigationProp<RootStackParamList>
>;

// Define combined navigation types
export type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export type SearchNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  StackNavigationProp<RootStackParamList>
>;

export type BucketListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'BucketList'>,
  StackNavigationProp<RootStackParamList>
>;

export type ProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<RootStackParamList>
>;
