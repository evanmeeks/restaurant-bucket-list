import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { ListItem } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { foursquareV3Service, Coordinates } from 'core';
import { SearchNavigationProp } from '../../../navigation/types';
import { defaultRestaurantImg } from '../../../assets/default_88.png';
// Austin coordinates (default location)
const DEFAULT_COORDINATES: Coordinates = {
  latitude: 30.2672,
  longitude: -97.7431,
};

// Default icon for when a venue doesn't have one
const DEFAULT_ICON = 'https://ss3.4sqi.net/img/categories_v2/food/default_88.png';

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('Restaurants');
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationRetrieved, setLocationRetrieved] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);

  const navigation = useNavigation<SearchNavigationProp>();

  // Search venues function - similar to the API test screen
  const searchVenues = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setLoaded(false);

    try {
      const data = await foursquareV3Service.searchNearbyVenues(
        DEFAULT_COORDINATES,
        query,
        undefined,
        1000,
        20
      );

      console.log('Foursquare API response:', data);

      // Transform the results to match the expected format
      const transformedVenues = data.results.map(venue => {
        // Create a venue object that matches the structure expected by renderItem
        return {
          id: venue.fsq_id,
          name: venue.name,
          categories: venue.categories || [
            {
              name: 'Restaurant',
              icon: {
                prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
                suffix: '.png',
              },
            },
          ],
          location: {
            formattedAddress:
              venue.location?.formatted_address ||
              [venue.location?.address, venue.location?.locality, venue.location?.region]
                .filter(Boolean)
                .join(', '),
            lat: venue.geocodes?.main?.latitude,
            lng: venue.geocodes?.main?.longitude,
          },
          referralId: venue.fsq_id, // Required for keyExtractor
        };
      });

      setVenues(transformedVenues);
      setLoaded(true);
    } catch (err: any) {
      console.error('Error fetching venues:', err);
      setVenues([]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Search handler - called when search input changes
  const searchHandler = (value: string) => {
    setSearchQuery(value);
    searchVenues(value);
  };

  // Initial search on component mount
  useEffect(() => {
    searchVenues(searchQuery);
  }, []);

  // Key extractor for the FlatList
  const keyExtractor = (item: any) => {
    return item.referralId.toString();
  };

  // Render item for the FlatList
  const renderItem = ({ item }: { item: any }) => {
    // Get icon URL
    let iconUrl = DEFAULT_ICON;
    if (
      item.categories &&
      item.categories.length > 0 &&
      item.categories[0].icon &&
      item.categories[0].icon.prefix &&
      item.categories[0].icon.suffix
    ) {
      iconUrl = `${item.categories[0].icon.prefix}88${item.categories[0].icon.suffix}`;
    }

    const categoryName =
      item.categories && item.categories.length > 0 ? item.categories[0].name : 'Restaurant';

    return (
      <ListItem
        onPress={() => {
          // Navigate to the Detail screen with the venue data
          navigation.navigate('Detail', { itemData: item });
        }}
        bottomDivider
      >
        <Image
          source={{ uri: iconUrl }}
          style={styles.iconImage}
          defaultSource={defaultRestaurantImg}
        />
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Subtitle style={styles.subtitleView}>
            <Text style={styles.ratingText}>{categoryName}</Text>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    );
  };

  // Render the restaurant list based on state
  const renderRestaurantList = () => {
    switch (`${locationRetrieved}|${loaded}`) {
      case 'true|true':
        return (
          <View style={styles.listContainer}>
            <TextInput
              style={styles.searchInput}
              onChangeText={text => searchHandler(text)}
              placeholder="Restaurants"
              value={searchQuery}
            />
            <FlatList
              data={venues}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={styles.flatListContent}
            />
          </View>
        );
      case 'false|false':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.statusText}>Retrieving Location</Text>
            <ActivityIndicator size="large" color="#FF4500" style={styles.loader} />
          </View>
        );
      case 'true|false':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.statusText}>Loading Restaurants and Venues</Text>
            <ActivityIndicator size="large" color="#FF4500" style={styles.loader} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant Search</Text>
      </View>
      {renderRestaurantList()}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333333',
  },
  loader: {
    marginTop: 10,
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 2,
    paddingTop: 5,
  },
  ratingText: {
    paddingLeft: 2,
    color: 'blue',
  },
  iconImage: {
    width: 50,
    height: 50,
    backgroundColor: '#CCC',
  },
});

export default SearchScreen;
