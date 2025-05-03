import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileNavigationProp } from '../../navigation/types';
import { theme } from '../../theme';

interface ProfileScreenProps {
  navigation: ProfileNavigationProp;
}

/**
 * Profile Screen Component (Stub)
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.description}>
        This is a stub for the ProfileScreen component. It will be replaced with the actual implementation.
      </Text>
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
  },
});

export default ProfileScreen;
