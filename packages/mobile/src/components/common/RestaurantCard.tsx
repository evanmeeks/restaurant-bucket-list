import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { getDistanceString } from '../../utils/distanceUtils';

interface RestaurantCardProps {
  venue: any; // Replace with proper Venue type from core
  isBucketListed: boolean;
  compact?: boolean;
  onPress: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  venue,
  isBucketListed,
  compact,
  onPress,
}) => {
  const priceText = useMemo(() => {
    if (!venue.price) return '';
    return venue.price.message || '$'.repeat(venue.price.tier || 1);
  }, [venue.price]);

  const distanceText = useMemo(() => {
    // Assuming user location is available; adjust as needed
    const userLocation = { latitude: 0, longitude: 0 }; // Placeholder
    if (venue.location && userLocation.latitude && userLocation.longitude) {
      return getDistanceString(
        userLocation.latitude,
        userLocation.longitude,
        venue.location.lat,
        venue.location.lng
      );
    }
    return '';
  }, [venue.location]);

  return (
    <TouchableOpacity style={[styles.container, compact && styles.compact]} onPress={onPress}>
      <View style={styles.imageContainer}>
        {venue.photos?.length > 0 ? (
          <Image
            source={{ uri: `${venue.photos[0].prefix}300x200${venue.photos[0].suffix}` }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icon name="restaurant" size={30} color={theme.colors.grey3} />
          </View>
        )}
        {isBucketListed && (
          <View style={styles.bookmarkedBadge}>
            <Icon name="bookmark" size={16} color="white" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {venue.categories?.[0]?.name || ''}
        </Text>
        <View style={styles.footer}>
          {priceText && <Text style={styles.price}>{priceText}</Text>}
          {distanceText && <Text style={styles.distance}>{distanceText}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compact: { marginBottom: 8 },
  imageContainer: { width: 100, height: 100, position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.grey5,
  },
  bookmarkedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.grey1, marginBottom: 4 },
  category: { fontSize: 14, color: theme.colors.grey3, marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { fontSize: 14, color: theme.colors.grey2 },
  distance: { fontSize: 14, color: theme.colors.grey2 },
});
