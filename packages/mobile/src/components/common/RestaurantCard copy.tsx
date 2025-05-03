// packages/mobile/src/components/common/RestaurantCard.tsx

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
  Share
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Icon, Button, Divider, Chip } from '@rneui/themed';
import { Venue } from 'core/src/models/venue';
import { useAppDispatch, useAppSelector } from 'core/src/store';
import {
  selectVenue,
  setSelectedVenue
} from 'core/src/store/slices/venuesSlice';
import {
  addToBucketList,
  removeFromBucketList
} from 'core/src/store/slices/bucketListSlice';
import { theme } from '../../theme';
import { getDistanceString } from '../../utils/distanceUtils';
import { getVenueImage } from '../../utils/imageUtils';

interface RestaurantCardProps {
  venue: Venue;
  isBucketListed?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

/**
 * Restaurant Card Component
 * - Displays restaurant information
 * - Handles add/remove from bucket list
 * - Provides navigation to detail screen
 * - Includes accessibility features
 */
export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  venue,
  isBucketListed = false,
  compact = false,
  onPress
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userLocation = useAppSelector(state => state.venues.userLocation);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  // Get venue distance
  const distance = useMemo(() => {
    if (userLocation && venue.location) {
      return getDistanceString(
        userLocation.latitude,
        userLocation.longitude,
        venue.location.lat,
        venue.location.lng
      );
    }
    return null;
  }, [userLocation, venue.location]);

  // Get venue image
  const image = useMemo(() => getVenueImage(venue), [venue]);

  // Get venue price
  const priceText = useMemo(() => {
    if (!venue.price) return '';
    return venue.price.message || '.repeat(venue.price.tier || 1);
  }, [venue.price]);

  // Get venue categories
  const categoryText = useMemo(() => {
    if (!venue.categories || venue.categories.length === 0) return '';
    return venue.categories.map(cat => cat.name).join(', ');
  }, [venue.categories]);

  // Handle press
  const handlePress = useCallback(() => {
    dispatch(setSelectedVenue(venue));

    if (onPress) {
      onPress();
    } else {
      navigation.navigate('VenueDetails', { venueId: venue.id });
    }
  }, [venue, dispatch, onPress, navigation]);

  // Handle bucket list toggle
  const handleBucketListToggle = useCallback(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    if (isBucketListed) {
      dispatch(removeFromBucketList(venue.id));
    } else {
      dispatch(addToBucketList({ venueId: venue.id }));
    }
  }, [venue.id, isBucketListed, dispatch, isAuthenticated, navigation]);

  // Handle map directions
  const handleDirections = useCallback(() => {
    if (!venue.location) return;

    const { lat, lng } = venue.location;
    const url = Platform.select({
      ios: `maps:?q=${venue.name}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${venue.name})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  }, [venue]);

  // Handle share
  const handleShare = useCallback(() => {
    const title = `Check out ${venue.name}`;
    const message = `I found ${venue.name} and thought you might be interested!\n${venue.location?.formattedAddress || ''}`;
    const url = venue.url;

    Share.share({
      title,
      message: url ? `${message}\n${url}` : message,
    });
  }, [venue]);

  // Render compact view
  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={styles.compactContainer}
        accessible={true}
        accessibilityLabel={`${venue.name}, ${categoryText}, ${distance ? `${distance} away` : ''}`}
        accessibilityRole="button"
      >
        <View style={styles.compactContent}>
          {image ? (
            <Image source={{ uri: image }} style={styles.compactImage} />
          ) : (
            <View style={[styles.compactImage, styles.placeholderImage]}>
              <Icon name="restaurant" type="material" size={20} color={theme.colors.grey3} />
            </View>
          )}
          <View style={styles.compactDetails}>
            <Text style={styles.compactName} numberOfLines={1}>{venue.name}</Text>
            {categoryText ? (
              <Text style={styles.compactCategory} numberOfLines={1}>{categoryText}</Text>
            ) : null}
            <View style={styles.compactFooter}>
              {priceText ? <Text style={styles.price}>{priceText}</Text> : null}
              {distance ? <Text style={styles.distance}>{distance}</Text> : null}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleBucketListToggle}
            style={styles.compactBookmark}
            accessible={true}
            accessibilityLabel={isBucketListed ? 'Remove from bucket list' : 'Add to bucket list'}
            accessibilityRole="button"
          >
            <Icon
              name={isBucketListed ? 'bookmark' : 'bookmark-outline'}
              type="material-community"
              size={24}
              color={isBucketListed ? theme.colors.primary : theme.colors.grey3}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Render full card
  return (
    <Card containerStyle={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        accessible={true}
        accessibilityLabel={`${venue.name}, ${categoryText}, ${distance ? `${distance} away` : ''}`}
        accessibilityRole="button"
      >
        {image ? (
          <Card.Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icon name="restaurant" type="material" size={40} color={theme.colors.grey3} />
          </View>
        )}

        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{venue.name}</Text>
            {venue.rating ? (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
                <Icon name="star" size={16} color={theme.colors.warning} />
              </View>
            ) : null}
          </View>

          {categoryText ? (
            <Text style={styles.category} numberOfLines={1}>{categoryText}</Text>
          ) : null}

          <View style={styles.infoContainer}>
            {priceText ? <Chip title={priceText} type="outline" /> : null}
            {distance ? <Chip title={distance} type="outline" /> : null}
            {venue.hours?.isOpen !== undefined && (
              <Chip
                title={venue.hours.isOpen ? 'Open' : 'Closed'}
                type="outline"
                titleStyle={{
                  color: venue.hours.isOpen ? theme.colors.success : theme.colors.error,
                }}
              />
            )}
          </View>
        </View>

        {venue.location?.formattedAddress ? (
          <View style={styles.addressContainer}>
            <Icon name="place" size={16} color={theme.colors.grey3} />
            <Text style={styles.address} numberOfLines={2}>
              {venue.location.formattedAddress}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <View style={styles.actionsContainer}>
        <Button
          title={isBucketListed ? "Saved" : "Save"}
          icon={{
            name: isBucketListed ? 'bookmark' : 'bookmark-outline',
            type: 'material-community',
            color: 'white',
          }}
          onPress={handleBucketListToggle}
          type={isBucketListed ? "solid" : "outline"}
          size="sm"
          buttonStyle={styles.actionButton}
        />

        <Button
          title="Directions"
          icon={{
            name: 'directions',
            type: 'material',
            color: theme.colors.primary,
          }}
          type="outline"
          onPress={handleDirections}
          size="sm"
          buttonStyle={styles.actionButton}
        />

        <Button
          title="Share"
          icon={{
            name: 'share',
            type: 'material',
            color: theme.colors.primary,
          }}
          type="outline"
          onPress={handleShare}
          size="sm"
          buttonStyle={styles.actionButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 0,
    margin: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    height: 180,
    width: '100%',
  },
  placeholderImage: {
    backgroundColor: theme.colors.grey5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.grey5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 2,
  },
  category: {
    fontSize: 14,
    color: theme.colors.grey3,
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  price: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  distance: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  address: {
    fontSize: 14,
    color: theme.colors.grey2,
    flex: 1,
    marginLeft: 4,
  },
  divider: {
    marginVertical: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
  },

  // Compact styles
  compactContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  compactDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  compactCategory: {
    fontSize: 14,
    color: theme.colors.grey3,
    marginBottom: 4,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactBookmark: {
    padding: 8,
  },
});