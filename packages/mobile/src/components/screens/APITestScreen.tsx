import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  SafeAreaView,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { foursquareV3Service, Coordinates } from 'core';

// API key for Foursquare - This should ideally be pulled from env or the core package
const FOURSQUARE_API_KEY = 'fsq3qBKJqJ2IpGLto+Kqe6ei5IIN6IG/5ty45BfAFK8WCAU=';

export const APITestScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [placesData, setPlacesData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchRadius] = useState<number>(1000); // Fixed radius for now, can be replaced with a slider later
  const [venueId, setVenueId] = useState<string>('4df44456d1add5a8baa15599'); // Default to Franklin Barbecue

  // Austin coordinates (default location)
  const AUSTIN_COORDINATES: Coordinates = {
    latitude: 30.2672,
    longitude: -97.7431,
  };

  // Function to search nearby places using the foursquareV3Service
  const searchNearbyPlaces = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await foursquareV3Service.searchNearbyVenues(
        AUSTIN_COORDINATES,
        searchQuery,
        undefined, // No categories - the search query will handle this
        searchRadius,
        10
      );
      
      console.log('Foursquare API response:', data);
      setPlacesData(data);
    } catch (err: any) {
      console.error('Error fetching data from Foursquare:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      console.log('Error details:', JSON.stringify(err, null, 2));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch place details using the foursquareV3Service
  const fetchPlaceDetails = async () => {
    if (!venueId.trim()) {
      setError('Please enter a venue ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await foursquareV3Service.getVenueDetails(venueId);
      
      console.log('Foursquare place details response:', data);
      setPlacesData(data);
    } catch (err: any) {
      console.error('Error fetching place details from Foursquare:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      console.log('Error details:', JSON.stringify(err, null, 2));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to get recommended venues using the foursquareV3Service
  const fetchRecommendedVenues = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await foursquareV3Service.getRecommendedVenues(AUSTIN_COORDINATES, 10);
      
      console.log('Foursquare recommended venues response:', data);
      setPlacesData(data);
    } catch (err: any) {
      console.error('Error fetching recommended venues from Foursquare:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      console.log('Error details:', JSON.stringify(err, null, 2));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Foursquare API Test</Text>

      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>Search Nearby Places</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for restaurants, coffee, beer, etc."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.searchHint}>
          Examples: "coffee", "burger", "Italian restaurant", "Torchy's Tacos"
        </Text>
        <Button title="Search" onPress={searchNearbyPlaces} />
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>More Options</Text>
        <View style={styles.buttonRow}>
          <Button title="Top Rated Places" onPress={fetchRecommendedVenues} />
        </View>
        
        <View style={styles.venueDetailsContainer}>
          <Text style={styles.inputLabel}>Venue ID for Details:</Text>
          <TextInput
            style={styles.input}
            value={venueId}
            onChangeText={setVenueId}
            placeholder="Enter a venue ID"
            placeholderTextColor="#999"
          />
          <Button title="Get Venue Details" onPress={fetchPlaceDetails} />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading data from Foursquare...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {placesData && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>API Response:</Text>
          <ScrollView 
            style={styles.jsonContainer}
            horizontal={true}
          >
            <Text style={styles.jsonText}>
              {JSON.stringify(placesData, null, 2)}
            </Text>
          </ScrollView>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
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
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  searchHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
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
  buttonRow: {
    marginBottom: 16,
  },
  venueDetailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffeeee',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
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
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jsonContainer: {
    backgroundColor: '#f5f7ff',
    padding: 10,
    borderRadius: 5,
    width: width - 48,
  },
  jsonText: {
    fontFamily: 'monospace',
  },
});
