import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { foursquareV3Service, Coordinates } from 'core';

// Default Austin coordinates
const DEFAULT_COORDINATES: Coordinates = {
  latitude: 30.2672,
  longitude: -97.7431,
};

// Default image when venue has no photos
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x100?text=No+Image';

// Venue item component
const VenueItem = ({ venue, onSave, isSaved }) => {
  // Extract the venue category name and icon
  const category = venue.categories && venue.categories.length > 0
    ? venue.categories[0]
    : { name: 'Restaurant', icon: null };
  
  // Construct the category icon URL if available
  const iconUrl = category.icon 
    ? `${category.icon.prefix}64${category.icon.suffix}`
    : null;

  return (
    <TouchableOpacity style={styles.venueItem}>
      <View style={styles.venueImageContainer}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} style={styles.venueImage} />
        ) : (
          <Image source={{ uri: DEFAULT_IMAGE }} style={styles.venueImage} />
        )}
      </View>
      <View style={styles.venueInfo}>
        <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
        <Text style={styles.venueCategory}>{category.name}</Text>
        {venue.location && venue.location.address && (
          <Text style={styles.venueAddress} numberOfLines={1}>
            {venue.location.address}
            {venue.location.locality ? `, ${venue.location.locality}` : ''}
          </Text>
        )}
        {venue.distance && (
          <Text style={styles.venueDistance}>
            {(venue.distance / 1609.34).toFixed(1)} miles away
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.saveButton, isSaved && styles.savedButton]} 
        onPress={() => onSave(venue)}
      >
        <Ionicons 
          name={isSaved ? "bookmark" : "bookmark-outline"} 
          size={24} 
          color={isSaved ? "#FFFFFF" : "#666666"} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const RestaurantListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedVenues, setSavedVenues] = useState<string[]>([]);

  // Search for venues when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchVenues();
    }
  }, [searchQuery]);

  // Search venues function
  const searchVenues = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await foursquareV3Service.searchNearbyVenues(
        DEFAULT_COORDINATES,
        searchQuery,
        undefined,
        1000,
        20
      );
      
      setVenues(data.results || []);
    } catch (err: any) {
      console.error('Error fetching venues:', err);
      setError(err.message || 'Failed to fetch venues');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle venue save/unsave
  const handleSaveVenue = (venue) => {
    const venueId = venue.fsq_id;
    if (savedVenues.includes(venueId)) {
      // Remove from saved venues
      setSavedVenues(savedVenues.filter(id => id !== venueId));
    } else {
      // Add to saved venues
      setSavedVenues([...savedVenues, venueId]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setVenues([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant Bucket List</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisine..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={searchVenues}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Searching restaurants...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={32} color="#FF4500" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={searchVenues}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : venues.length > 0 ? (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.fsq_id}
          renderItem={({ item }) => (
            <VenueItem 
              venue={item} 
              onSave={handleSaveVenue}
              isSaved={savedVenues.includes(item.fsq_id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No restaurants found for "{searchQuery}"</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : (
        <View style={styles.initialContainer}>
          <Ionicons name="search-outline" size={64} color="#CCCCCC" />
          <Text style={styles.initialText}>Search for restaurants</Text>
          <Text style={styles.initialSubtext}>Find places to add to your bucket list</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF4500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF4500',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 12,
  },
  venueItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  venueImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
  },
  venueInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  venueCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 2,
  },
  venueDistance: {
    fontSize: 12,
    color: '#FF4500',
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
  },
  savedButton: {
    backgroundColor: '#FF4500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  initialText: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  initialSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default RestaurantListScreen;
