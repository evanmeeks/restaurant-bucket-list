import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { useDispatch } from 'react-redux';
import { addToBucketList } from 'core/src/store/slices/bucketListSlice';
import { useAppSelector } from 'core/src/store';
import { defaultRestaurantImg } from '../../../assets/default_88.png';
// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

// Default icon for when venue doesn't have photos - using the highest resolution
const DEFAULT_ICON = 'https://ss3.4sqi.net/img/categories_v2/food/default_512.png';

export const DetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();
  const dispatch = useDispatch();

  // Make sure itemData exists before using it
  const venue = route.params?.itemData;

  // Get saved venues to check if this one is already saved
  const savedVenues = useAppSelector(state => state.bucketList.items);
  const isVenueSaved = venue ? savedVenues.some(item => item.id === venue.id) : false;

  // Fallback for when no venue data is passed
  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4500" />
          <Text style={styles.errorText}>Venue data not available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Using placeholder data if specific data isn't available
  const venueName = venue.name || 'Restaurant';
  const venueCategory =
    venue.categories && venue.categories.length > 0 ? venue.categories[0].name : 'Restaurant';
  const venueAddress = venue.location?.formattedAddress || 'Address not available';

  // Get icon URL or use default - use the highest resolution available
  let iconUrl = DEFAULT_ICON;
  if (
    venue.categories &&
    venue.categories.length > 0 &&
    venue.categories[0].icon &&
    venue.categories[0].icon.prefix &&
    venue.categories[0].icon.suffix
  ) {
    // Use the highest resolution icon (512px)
    iconUrl = `${venue.categories[0].icon.prefix}512${venue.categories[0].icon.suffix}`;
  }

  // Handle saving venue to bucket list
  const handleSaveVenue = () => {
    if (!isVenueSaved) {
      dispatch(addToBucketList(venue));
      Alert.alert('Saved', `${venueName} has been added to your bucket list!`);
    } else {
      Alert.alert('Already Saved', `${venueName} is already in your bucket list.`);
    }
  };

  // Handle opening maps for directions
  const handleGetDirections = () => {
    if (venue.location?.lat && venue.location?.lng) {
      const url = Platform.select({
        ios: `maps:?q=${venueName}&ll=${venue.location.lat},${venue.location.lng}`,
        android: `geo:${venue.location.lat},${venue.location.lng}?q=${venueName}`,
      });

      if (url) {
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('Error', 'Maps application is not available');
          }
        });
      }
    } else {
      Alert.alert('Error', 'Location coordinates not available');
    }
  };

  // Handle sharing the venue
  const handleShareVenue = () => {
    const message = `Check out ${venueName} - ${venueCategory}\n${venueAddress}`;

    if (Platform.OS === 'ios') {
      Alert.alert('Share', 'Sharing functionality would be implemented here', [{ text: 'OK' }]);
    } else {
      Alert.alert('Share', message, [{ text: 'OK' }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {venueName}
          </Text>
        </View>

        {/* Hero image section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: iconUrl }}
            style={styles.heroImage}
            resizeMode="cover"
            defaultSource={defaultRestaurantImg}
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{iconUrl}</Text>
            <Text style={styles.categoryText}>{venueCategory}</Text>
          </View>
        </View>

        {/* Details section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.venueName}>{venueName}</Text>

          <View style={styles.addressContainer}>
            <Ionicons name="location" size={18} color="#666666" style={styles.addressIcon} />
            <Text style={styles.venueAddress}>{venueAddress}</Text>
          </View>

          {/* Map section if coordinates are available */}
          {venue.location && venue.location.lat && venue.location.lng ? (
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={48} color="#CCCCCC" />
                <Text style={styles.mapPlaceholderText}>
                  Map would display here at coordinates:
                </Text>
                <Text style={styles.mapCoordinates}>
                  {venue.location.lat}, {venue.location.lng}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, isVenueSaved && styles.savedActionButton]}
              onPress={handleSaveVenue}
            >
              <Ionicons
                name={isVenueSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>{isVenueSaved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShareVenue}>
              <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
              <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 16,
  },
  venueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addressIcon: {
    marginRight: 8,
  },
  venueAddress: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  mapPlaceholderText: {
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  mapCoordinates: {
    color: '#999999',
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF4500',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  savedActionButton: {
    backgroundColor: '#4CAF50', // Green for already saved items
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 12,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DetailScreen;
