import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Image,
  Platform,
  Dimensions,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from 'core/src/store';
import {
  getUserLocation,
  fetchNearbyVenues,
  fetchRecommendedVenues,
} from 'core/src/store/slices/venuesSlice';
import { useGeolocation } from 'core/src/hooks/useGeolocation';
import { RestaurantCard } from '../common/RestaurantCard';
import { CategoryCard } from '../common/CategoryCard';
import { LocationPermissionRequest } from '../common/LocationPermissionRequest';
import { theme } from '../../theme';
import { ExploreNavigationProp } from '../../navigation/types';
import { categories } from '../../theme/categories';

interface ExploreScreenProps {
  navigation: ExploreNavigationProp;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { coordinates, permissionGranted, requestLocation } = useGeolocation();

  const nearbyVenues = useAppSelector(state => state.venues.nearby.venues);
  const nearbyLoading = useAppSelector(state => state.venues.nearby.loading);
  const nearbyError = useAppSelector(state => state.venues.nearby.error);

  const recommendedVenues = useAppSelector(state => state.venues.recommended.venues);
  const recommendedLoading = useAppSelector(state => state.venues.recommended.loading);
  const recommendedError = useAppSelector(state => state.venues.recommended.error);

  const bucketListItems = useAppSelector(state => state.bucketList.items);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const userName = useAppSelector(state => state.auth.user?.displayName);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const topCategories = categories.slice(0, 6);

  const isVenueInBucketList = useCallback(
    (venueId: string) => {
      return bucketListItems.some(item => item.venueId === venueId);
    },
    [bucketListItems]
  );

  useFocusEffect(
    useCallback(() => {
      if (permissionGranted && coordinates) {
        loadVenues();
      }
    }, [permissionGranted, coordinates])
  );

  const loadVenues = useCallback(() => {
    if (coordinates) {
      dispatch(fetchNearbyVenues({ coordinates }));
      dispatch(fetchRecommendedVenues({ coordinates, limit: 5 }));
    }
  }, [coordinates, dispatch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadVenues();
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [loadVenues]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { screen: 'SearchResults', params: { query: searchQuery } });
      setSearchQuery('');
    }
  }, [searchQuery, navigation]);

  const handleVenuePress = useCallback(
    (venueId: string) => {
      navigation.navigate('VenueDetails', { venueId });
    },
    [navigation]
  );

  const handleCategoryPress = useCallback(
    (categoryId: string, categoryName: string) => {
      navigation.navigate('Search', {
        screen: 'SearchResults',
        params: {
          categories: [categoryId],
          title: categoryName,
        },
      });
    },
    [navigation]
  );

  const handleSeeAllPress = useCallback(
    (type: 'nearby' | 'recommended') => {
      if (type === 'nearby') {
        navigation.navigate('Explore', { screen: 'NearbyVenues' });
      } else {
        navigation.navigate('Explore', { screen: 'RecommendedVenues' });
      }
    },
    [navigation]
  );

  if (!permissionGranted) {
    return <LocationPermissionRequest onRequestLocation={requestLocation} />;
  }

  if (!coordinates) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                {isAuthenticated && userName ? `Hello, ${userName.split(' ')[0]}!` : 'Hello there!'}
              </Text>
              <Text style={styles.subtitle}>Discover amazing restaurants</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
              accessible={true}
              accessibilityLabel="Your profile"
              accessibilityRole="button"
            >
              <Icon name="person" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            accessibilityLabel="Search for restaurants"
            accessibilityHint="Enter restaurant name or cuisine"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Icon name="search" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Explore', { screen: 'CategoryList' })}
              accessible={true}
              accessibilityLabel="View all categories"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {topCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category.id, category.name)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity
              onPress={() => handleSeeAllPress('recommended')}
              accessible={true}
              accessibilityLabel="View all recommended restaurants"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recommendedLoading && recommendedVenues.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Finding recommendations...</Text>
            </View>
          ) : recommendedError ? (
            <View style={styles.errorContainer}>
              <Icon name="error" size={24} color={theme.colors.error} />
              <Text style={styles.errorText}>{recommendedError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadVenues}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : recommendedVenues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="restaurant" size={40} color={theme.colors.grey3} />
              <Text style={styles.emptyText}>No recommendations found</Text>
            </View>
          ) : (
            <FlatList
              data={recommendedVenues.slice(0, 5)}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recommendedItem}
                  onPress={() => handleVenuePress(item.id)}
                  accessible={true}
                  accessibilityLabel={`${item.name}, ${item.categories?.[0]?.name || ''}`}
                  accessibilityRole="button"
                >
                  <View style={styles.recommendedCard}>
                    <View style={styles.cardImageContainer}>
                      {item.photos?.length > 0 ? (
                        <Image
                          source={{
                            uri: `${item.photos[0].prefix}300x200${item.photos[0].suffix}`,
                          }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]}>
                          <Icon name="restaurant" size={30} color={theme.colors.grey3} />
                        </View>
                      )}
                      {isVenueInBucketList(item.id) && (
                        <View style={styles.bookmarkedBadge}>
                          <Icon name="bookmark" size={16} color="white" />
                        </View>
                      )}
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.categories && item.categories.length > 0 && (
                        <Text style={styles.cardCategory} numberOfLines={1}>
                          {item.categories[0].name}
                        </Text>
                      )}
                      <View style={styles.cardFooter}>
                        {item.rating && (
                          <View style={styles.ratingContainer}>
                            <Icon name="star" size={14} color={theme.colors.warning} />
                            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                          </View>
                        )}
                        {item.price && (
                          <Text style={styles.price}>
                            {item.price.message || '$'.repeat(item.price.tier || 1)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
            <TouchableOpacity
              onPress={() => handleSeeAllPress('nearby')}
              accessible={true}
              accessibilityLabel="View all nearby restaurants"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {nearbyLoading && nearbyVenues.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Finding nearby restaurants...</Text>
            </View>
          ) : nearbyError ? (
            <View style={styles.errorContainer}>
              <Icon name="error" size={24} color={theme.colors.error} />
              <Text style={styles.errorText}>{nearbyError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadVenues}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : nearbyVenues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="place" size={40} color={theme.colors.grey3} />
              <Text style={styles.emptyText}>No nearby restaurants found</Text>
            </View>
          ) : (
            <View style={styles.nearbyContainer}>
              {nearbyVenues.slice(0, 5).map(venue => (
                <RestaurantCard
                  key={venue.id}
                  venue={venue}
                  isBucketListed={isVenueInBucketList(venue.id)}
                  compact={true}
                  onPress={() => handleVenuePress(venue.id)}
                />
              ))}
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => handleSeeAllPress('nearby')}
                accessible={true}
                accessibilityLabel="View all nearby restaurants"
                accessibilityRole="button"
              >
                <Text style={styles.viewAllText}>View All Nearby</Text>
                <Icon name="chevron-right" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isAuthenticated && bucketListItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Bucket List</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('BucketList')}
                accessible={true}
                accessibilityLabel="View your bucket list"
                accessibilityRole="button"
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bucketListPreview}
            >
              {bucketListItems.slice(0, 5).map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.bucketListItem}
                  onPress={() => handleVenuePress(item.venueId)}
                  accessible={true}
                  accessibilityLabel={`${item.venue.name} from your bucket list`}
                  accessibilityRole="button"
                >
                  <View style={styles.bucketListCard}>
                    <View style={styles.cardImageContainer}>
                      {item.venue.photos?.length > 0 ? (
                        <Image
                          source={{
                            uri: `${item.venue.photos[0].prefix}300x200${item.venue.photos[0].suffix}`,
                          }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]}>
                          <Icon name="restaurant" size={30} color={theme.colors.grey3} />
                        </View>
                      )}
                      {item.priority && (
                        <View
                          style={[
                            styles.priorityBadge,
                            item.priority === 'high' && styles.highPriority,
                            item.priority === 'medium' && styles.mediumPriority,
                            item.priority === 'low' && styles.lowPriority,
                          ]}
                        >
                          <Icon name="flag" size={14} color="white" />
                        </View>
                      )}
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.venue.name}
                      </Text>
                      {item.venue.categories && item.venue.categories.length > 0 && (
                        <Text style={styles.cardCategory} numberOfLines={1}>
                          {item.venue.categories[0].name}
                        </Text>
                      )}
                      {item.visitedAt ? (
                        <View style={styles.visitedBadge}>
                          <Icon name="check-circle" size={14} color={theme.colors.success} />
                          <Text style={styles.visitedText}>Visited</Text>
                        </View>
                      ) : item.plannedVisitDate ? (
                        <Text style={styles.plannedDate}>
                          Planned: {new Date(item.plannedVisitDate).toLocaleDateString()}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { flexGrow: 1 },
  header: { padding: 16, paddingTop: Platform.OS === 'ios' ? 0 : 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, color: theme.colors.grey1 },
  subtitle: { fontSize: 16, color: theme.colors.grey3 },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.grey5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: theme.colors.grey5,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 16,
  },
  searchButton: { marginLeft: 8, padding: 8 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.grey1 },
  seeAll: { fontSize: 14, color: theme.colors.primary, fontWeight: '500' },
  categoriesContainer: { paddingHorizontal: 12 },
  recommendedList: { paddingHorizontal: 12, paddingVertical: 4 },
  recommendedItem: { width: width * 0.7, maxWidth: 280, marginHorizontal: 4 },
  recommendedCard: {
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: 150, backgroundColor: theme.colors.grey5 },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
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
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highPriority: { backgroundColor: theme.colors.error },
  mediumPriority: { backgroundColor: theme.colors.warning },
  lowPriority: { backgroundColor: theme.colors.success },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: theme.colors.grey1 },
  cardCategory: { fontSize: 14, color: theme.colors.grey3, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 14, marginLeft: 4, color: theme.colors.grey2 },
  price: { fontSize: 14, color: theme.colors.grey2 },
  nearbyContainer: { paddingHorizontal: 16 },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.grey4,
    borderRadius: 8,
    marginVertical: 8,
  },
  viewAllText: { fontSize: 14, fontWeight: '500', color: theme.colors.primary, marginRight: 4 },
  bucketListPreview: { paddingHorizontal: 12, paddingVertical: 4 },
  bucketListItem: { width: width * 0.6, maxWidth: 240, marginHorizontal: 4 },
  bucketListCard: {
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  visitedBadge: { flexDirection: 'row', alignItems: 'center' },
  visitedText: { fontSize: 12, color: theme.colors.success, marginLeft: 4 },
  plannedDate: { fontSize: 12, color: theme.colors.grey3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { fontSize: 16, color: theme.colors.grey3, marginLeft: 12 },
  errorContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: theme.colors.error, textAlign: 'center', marginVertical: 12 },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: theme.colors.grey3, textAlign: 'center', marginTop: 12 },
  retryButton: { padding: 10, borderRadius: 8, backgroundColor: theme.colors.primary },
  retryButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
});
