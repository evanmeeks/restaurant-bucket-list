import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location'; // Import expo-location
import { theme } from '../../theme';

interface LocationPermissionRequestProps {
  onRequestLocation: () => void;
}

export const LocationPermissionRequest: React.FC<LocationPermissionRequestProps> = ({
  onRequestLocation,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  // Check permission status on component mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  // Check current permission status
  const checkPermissionStatus = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  // Request location permission
  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        onRequestLocation();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Icon name="location-on" size={80} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Location Access Needed</Text>
        <Text style={styles.description}>
          Restaurant Bucket List needs access to your location to find restaurants near you. We use
          this information only to show you relevant results and never track or store your location
          data.
        </Text>
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Icon name="place" size={24} color={theme.colors.primary} />
            <Text style={styles.benefitText}>Discover nearby restaurants</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="star" size={24} color={theme.colors.primary} />
            <Text style={styles.benefitText}>Get personalized recommendations</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="directions" size={24} color={theme.colors.primary} />
            <Text style={styles.benefitText}>See distances and get directions</Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={requestPermission}
            testID="allow-location-button"
          >
            <Icon name="location-on" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonTitle}>Allow Location Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={openSettings}>
            <Icon
              name="settings"
              size={20}
              color={theme.colors.primary}
              style={styles.buttonIcon}
            />
            <Text style={styles.secondaryButtonTitle}>Open Settings</Text>
          </TouchableOpacity>
          <Text style={styles.privacyNote}>
            You can change this permission later in your device settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, justifyContent: 'center' },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.grey5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: theme.colors.grey1,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: theme.colors.grey2,
    lineHeight: 24,
  },
  benefitsContainer: { width: '100%', marginBottom: 32 },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  benefitText: { fontSize: 16, marginLeft: 12, color: theme.colors.grey2 },
  buttonsContainer: { width: '100%', alignItems: 'center' },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: { fontSize: 16, fontWeight: '600', color: 'white' },
  secondaryButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonTitle: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
  buttonIcon: { marginRight: 8 },
  privacyNote: { fontSize: 14, textAlign: 'center', color: theme.colors.grey3, marginTop: 8 },
});
