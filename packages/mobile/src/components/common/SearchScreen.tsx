import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useDispatch } from 'react-redux';
import { Venue } from '@restaurant-bucket-list/core/src/api/foursquare';
import FoursquareAPI from '@restaurant-bucket-list/core/src/api/foursquare';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const foursquare = new FoursquareAPI(process.env.FOURSQUARE_API_KEY);
      const results = await foursquare.searchVenues({
        query: searchQuery,
        limit: 20,
      });

      setSearchResults(results);
    } catch (err) {
      setError('Failed to search venues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderVenueItem = ({ item: venue }: { item: Venue }) => (
    <TouchableOpacity
      style={[styles.venueItem, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('RestaurantDetails', { venue })}
    >
      <View style={styles.venueInfo}>
        <Text style={[styles.venueName, { color: theme.colors.text }]}>{venue.name}</Text>
        <Text style={[styles.venueAddress, { color: theme.colors.text }]}>
          {venue.location.address}
        </Text>
        {venue.stats?.rating && (
          <Text style={[styles.venueRating, { color: theme.colors.primary }]}>
            Rating: {venue.stats.rating.toFixed(1)}
          </Text>
        )}
      </View>
      <Icon name="chevron-right" size={24} color={theme.colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search restaurants..."
          placeholderTextColor={theme.colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSearch}
        >
          <Icon name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={theme.colors.primary}
        />
      ) : error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderVenueItem}
          keyExtractor={(item) => item.fsq_id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            searchQuery ? (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No results found
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default SearchScreen;