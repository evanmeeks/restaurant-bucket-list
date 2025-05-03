import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@restaurant-bucket-list/core/src/store';
import { Venue } from '@restaurant-bucket-list/core/src/api/foursquare';
import FoursquareAPI from '@restaurant-bucket-list/core/src/api/foursquare';
import Geolocation from '@react-native-community/geolocation';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNearbyVenues = async () => {
      try {
        setLoading(true);
        const position = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });

        const foursquare = new FoursquareAPI(process.env.FOURSQUARE_API_KEY);
        const venues = await foursquare.searchVenues({
          ll: `${position.coords.latitude},${position.coords.longitude}`,
          radius: 1000,
          limit: 10,
        });

        setNearbyVenues(venues);
      } catch (err) {
        setError('Failed to fetch nearby venues');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyVenues();
  }, []);

  const renderVenueCard = (venue: Venue) => (
    <TouchableOpacity
      key={venue.fsq_id}
      style={[styles.venueCard, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('RestaurantDetails', { venue })}
    >
      <Text style={[styles.venueName, { color: theme.colors.text }]}>{venue.name}</Text>
      <Text style={[styles.venueAddress, { color: theme.colors.text }]}>
        {venue.location.address}
      </Text>
      {venue.stats?.rating && (
        <Text style={[styles.venueRating, { color: theme.colors.primary }]}>
          Rating: {venue.stats.rating.toFixed(1)}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Nearby Restaurants</Text>
      {nearbyVenues.map(renderVenueCard)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  venueCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  venueRating: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
});

export default HomeScreen;