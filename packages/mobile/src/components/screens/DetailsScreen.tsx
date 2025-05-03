import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme';

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;
type DetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Details'>;

interface DetailsScreenProps {
  route: DetailsScreenRouteProp;
  navigation: DetailsScreenNavigationProp;
}

/**
 * Details Screen Component (Stub)
 */
export const DetailsScreen: React.FC<DetailsScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text style={styles.description}>
        This is a stub for the DetailsScreen component. It will be replaced with the actual implementation.
      </Text>
      <Text style={styles.id}>Item ID: {id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  id: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
  },
});

export default DetailsScreen;
