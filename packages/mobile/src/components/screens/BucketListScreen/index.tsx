import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Fixed imports - using local hooks instead of core package hooks
import { useAppSelector } from '../../../hooks/redux';
import {
  removeFromBucketList,
  markAsVisited,
  fetchBucketList,
} from 'core/src/store/slices/bucketListSlice';
import { BucketListNavigationProp } from '../../../navigation/types';
import { BucketListItem } from 'core/src/models/bucket-list';
import { testFoursquareAPI } from 'core/src/api/testAPI';
import HooksTestComponent from '../../debug/HooksTestComponent';

// Simple debug panel component inline
const SimpleDebugPanel: React.FC = () => {
  if (!__DEV__) return null;
  
  return (
    <View style={{
      position: 'absolute',
      bottom: 100,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 8,
      borderRadius: 4,
    }}>
      <Text style={{ color: 'white', fontSize: 10 }}>Debug Mode</Text>
    </View>
  );
};

// Default image when venue has no photo
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x100?text=No+Image';

/**
 * BucketListScreen Component - Clean version without complex features
 * This version avoids the context issues by keeping things simple
 */
export const BucketListScreen: React.FC = () => {
  const navigation = useNavigation<BucketListNavigationProp>();
  const dispatch = useDispatch();

  // Get the bucket list items and loading state from Redux store
  const items = useAppSelector(state => state.bucketList.items);
  const loading = useAppSelector(state => state.bucketList.loading);
  const error = useAppSelector(state => state.bucketList.error);

  // Fetch bucket list on mount
  useEffect(() => {
    console.log('🪣 BucketListScreen mounted, fetching bucket list');
    dispatch(fetchBucketList());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('🪣 Items updated:', items.length);
    
    // Test API on first load
    if (items.length === 0) {
      testFoursquareAPI().then(result => {
        if (result.success) {
          console.log('✅ Foursquare API is working!');
        } else {
          console.error('❌ Foursquare API test failed:', result.error);
        }
      });
    }
  }, [items]);

  // Handle removing an item from the bucket list
  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Restaurant',
      'Are you sure you want to remove this restaurant from your bucket list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            console.log('🗑️ Removing from bucket list:', id);
            dispatch(removeFromBucketList(id));
          },
        },
      ]
    );
  };

  // Handle marking an item as visited
  const handleMarkVisited = (id: string) => {
    Alert.alert('Mark as Visited', 'Have you visited this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: "Yes, I've been there!",
        onPress: () => {
          console.log('✅ Marking as visited:', id);
          dispatch(markAsVisited({ id }));
        },
      },
    ]);
  };

  // Handle selecting an item (navigate to detail screen)
  const handleSelectItem = (item: BucketListItem) => {
    navigation.navigate('Detail', { itemData: item.venue });
  };

  // Show loading state
  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bucket List</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Loading bucket list...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bucket List</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
          <Text style={styles.errorText}>Error loading bucket list</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchBucketList())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bucket List</Text>
        <Text style={styles.subtitle}>{items.length} restaurants saved</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Your bucket list is empty</Text>
          <Text style={styles.emptySubtext}>
            Save restaurants to visit later by tapping the bookmark icon
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.searchButtonText}>Find Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.itemContainer}
              onPress={() => handleSelectItem(item)}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.venue.photo || DEFAULT_IMAGE }} 
                  style={styles.image} 
                />
              </View>
              
              <View style={styles.detailsContainer}>
                <Text style={styles.nameText}>{item.venue.name}</Text>
                <Text style={styles.categoryText}>{item.venue.category}</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.venue.address}
                </Text>
                
                {item.visitedAt && (
                  <View style={styles.visitedContainer}>
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                    <Text style={styles.visitedText}>
                      Visited on {new Date(item.visitedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionsContainer}>
                {!item.visitedAt && (
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => handleMarkVisited(item.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => dispatch(fetchBucketList())}
        />
      )}
      
      {/* Hooks Test Component */}
      <HooksTestComponent />
      
      {/* Simple Debug Panel */}
      <SimpleDebugPanel />
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
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  listContainer: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5252',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FF4500',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 6,
  },
  visitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  visitedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
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
    marginBottom: 20,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FF4500',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BucketListScreen;