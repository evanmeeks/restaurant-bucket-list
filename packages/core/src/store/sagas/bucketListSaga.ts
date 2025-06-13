import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  fetchBucketList,
  fetchBucketListSuccess,
  fetchBucketListFailure,
  addToBucketList,
  addToBucketListSuccess,
  addToBucketListFailure,
  updateBucketListItem,
  updateBucketListItemSuccess,
  updateBucketListItemFailure,
  removeFromBucketList,
  removeFromBucketListSuccess,
  removeFromBucketListFailure,
  markAsVisited,
  markAsVisitedSuccess,
  markAsVisitedFailure
} from '../slices/bucketListSlice';
import { selectVenue } from '../slices/venuesSlice';
import { BucketListItem } from '../../models/bucket-list';
import { RootState } from '../index';
import { Venue } from '../../models/venue';
import { foursquareService } from '../../api/foursquare';

/**
 * BucketList Saga
 * Handles async operations for the bucket list feature
 */

// Default mock user ID for development
const MOCK_USER_ID = 'mock-user-1';

// Helper function to get user ID from state, with fallback to mock user
const getUserId = (state: RootState) => {
  const userId = state.auth.user?.id;
  // Always use mock user ID during development
  if (!userId) {
    console.warn('No authenticated user found. Using mock user.');
    return MOCK_USER_ID;
  }
  return userId;
};

/**
 * Handle fetch bucket list
 * Fetches the user's bucket list from the backend/Firebase
 */
function* handleFetchBucketList() {
  try {
    console.log('Fetching bucket list...');
    const userId = yield select(getUserId);
    console.log('Current user ID:', userId);
    
    // Call API to get user's bucket list
    // In a real app, this would be a call to your backend API
    // or a service like Firebase
    const items = yield call(fetchBucketListFromStorage, userId);
    console.log('Fetched items from storage:', items);
    
    // Enhance items with venue details if needed
    const enhancedItems = yield call(enhanceBucketListWithVenueDetails, items);
    console.log('Enhanced items with venue details:', enhancedItems);
    
    // Handle success
    yield put(fetchBucketListSuccess(enhancedItems));
  } catch (error) {
    console.error('Failed to fetch bucket list:', error);
    yield put(fetchBucketListFailure(error.message || 'Failed to fetch bucket list'));
  }
}

// Mock function to fetch bucket list from AsyncStorage
async function fetchBucketListFromStorage(userId: string): Promise<BucketListItem[]> {
  try {
    console.log(`Fetching items from AsyncStorage for user ${userId}`);
    // Get items from AsyncStorage
    const storedItems = await AsyncStorage.getItem(`bucketList_${userId}`);
    console.log('Raw stored items:', storedItems);
    if (storedItems) {
      return JSON.parse(storedItems);
    }
  } catch (error) {
    console.error('Error reading from AsyncStorage:', error);
  }
  
  // Return empty array if nothing found or error
  return [];
}

// Helper function to enhance bucket list items with venue details
function* enhanceBucketListWithVenueDetails(items: BucketListItem[]): Generator<any, BucketListItem[], any> {
  // For each item, ensure we have complete venue details
  const enhancedItems = [];
  
  for (const item of items) {
    // If venue is missing or incomplete, fetch venue details
    if (!item.venue || Object.keys(item.venue).length === 0) {
      try {
        const response = yield call(
          foursquareService.getVenueDetails.bind(foursquareService),
          item.venueId
        );
        
        enhancedItems.push({
          ...item,
          venue: response.venue
        });
      } catch (error) {
        console.error(`Failed to fetch venue details for ${item.venueId}:`, error);
        // Still include the item even without venue details
        enhancedItems.push(item);
      }
    } else {
      enhancedItems.push(item);
    }
  }
  
  return enhancedItems;
}

/**
 * Handle add to bucket list
 * Adds a venue to the user's bucket list
 */
function* handleAddToBucketList(action: PayloadAction<any>) {
  try {
    console.log('Adding to bucket list, payload:', action.payload);
    const userId = yield select(getUserId);
    console.log('Current user ID:', userId);
    
    // Get the venue data from the action payload
    const venue = action.payload;
    
    // Create bucket list item
    const newItem: BucketListItem = {
      id: `${userId}_${venue.fsq_id}_${Date.now()}`, // Generate a unique ID
      venueId: venue.fsq_id,
      userId,
      venue: {
        id: venue.fsq_id,
        name: venue.name,
        category: venue.categories && venue.categories.length > 0 
          ? venue.categories[0].name 
          : 'Restaurant',
        address: venue.location ? 
          venue.location.formatted_address || 
          [venue.location.address, venue.location.locality, venue.location.region]
            .filter(Boolean).join(', ') 
          : '',
        coordinates: venue.geocodes?.main ? {
          latitude: venue.geocodes.main.latitude,
          longitude: venue.geocodes.main.longitude
        } : undefined,
        photo: venue.photos && venue.photos.length > 0 
          ? `${venue.photos[0].prefix}original${venue.photos[0].suffix}` 
          : undefined,
        rating: venue.rating,
      },
      addedAt: Date.now(),
      notes: '',
      tags: [],
      priority: 'medium',
    };
    
    console.log('Created new bucket list item:', newItem);
    
    // Save to AsyncStorage
    yield call(saveBucketListItemToStorage, newItem);
    
    // Handle success
    yield put(addToBucketListSuccess(newItem));
    console.log('Add to bucket list success action dispatched');
  } catch (error) {
    console.error('Failed to add to bucket list:', error);
    yield put(addToBucketListFailure(error.message || 'Failed to add to bucket list'));
  }
}

// Function to save bucket list item to AsyncStorage
async function saveBucketListItemToStorage(item: BucketListItem): Promise<void> {
  try {
    console.log(`Saving item to AsyncStorage for user ${item.userId}`);
    // Get existing items
    const storedItems = await AsyncStorage.getItem(`bucketList_${item.userId}`);
    let items = storedItems ? JSON.parse(storedItems) : [];
    console.log('Existing items:', items);
    
    // Add new item if it doesn't exist already
    if (!items.some(existingItem => existingItem.id === item.id)) {
      items.push(item);
      console.log('Added new item to items list');
    } else {
      console.log('Item already exists, not adding');
    }
    
    // Save back to AsyncStorage
    const itemsJson = JSON.stringify(items);
    console.log('Saving items to AsyncStorage:', itemsJson);
    await AsyncStorage.setItem(`bucketList_${item.userId}`, itemsJson);
    console.log('Successfully saved to AsyncStorage');
  } catch (error) {
    console.error('Error saving to AsyncStorage:', error);
  }
}

/**
 * Handle update bucket list item
 * Updates an existing bucket list item
 */
function* handleUpdateBucketListItem(action: PayloadAction<BucketListItem>) {
  try {
    console.log('Updating bucket list item:', action.payload);
    const userId = yield select(getUserId);
    const updatedItem = action.payload;
    
    // Make sure the user owns this item
    if (updatedItem.userId && updatedItem.userId !== userId) {
      throw new Error('Cannot update an item that belongs to another user');
    }
    
    // Save to AsyncStorage
    yield call(updateBucketListItemInStorage, updatedItem);
    
    // Handle success
    yield put(updateBucketListItemSuccess(updatedItem));
    console.log('Update bucket list item success action dispatched');
  } catch (error) {
    console.error('Failed to update bucket list item:', error);
    yield put(updateBucketListItemFailure(error.message || 'Failed to update bucket list item'));
  }
}

// Function to update bucket list item in AsyncStorage
async function updateBucketListItemInStorage(item: BucketListItem): Promise<void> {
  try {
    console.log(`Updating item in AsyncStorage for user ${item.userId}`);
    // Get existing items
    const storedItems = await AsyncStorage.getItem(`bucketList_${item.userId}`);
    if (storedItems) {
      let items = JSON.parse(storedItems);
      console.log('Existing items:', items);
      
      // Find and update the item
      const index = items.findIndex(existingItem => existingItem.id === item.id);
      if (index !== -1) {
        items[index] = item;
        console.log('Updated item at index', index);
        
        // Save back to AsyncStorage
        await AsyncStorage.setItem(`bucketList_${item.userId}`, JSON.stringify(items));
        console.log('Successfully saved updated items to AsyncStorage');
      } else {
        console.log('Item not found in existing items');
      }
    } else {
      console.log('No existing items found');
    }
  } catch (error) {
    console.error('Error updating in AsyncStorage:', error);
  }
}

/**
 * Handle remove from bucket list
 * Removes an item from the user's bucket list
 */
function* handleRemoveFromBucketList(action: PayloadAction<string>) {
  try {
    console.log('Removing from bucket list, item ID:', action.payload);
    const userId = yield select(getUserId);
    const itemId = action.payload;
    
    // Delete from AsyncStorage
    yield call(deleteBucketListItemFromStorage, itemId, userId);
    
    // Handle success
    yield put(removeFromBucketListSuccess(itemId));
    console.log('Remove from bucket list success action dispatched');
  } catch (error) {
    console.error('Failed to remove from bucket list:', error);
    yield put(removeFromBucketListFailure(error.message || 'Failed to remove from bucket list'));
  }
}

// Function to delete bucket list item from AsyncStorage
async function deleteBucketListItemFromStorage(itemId: string, userId: string): Promise<void> {
  try {
    console.log(`Deleting item from AsyncStorage for user ${userId}, item ID: ${itemId}`);
    // Get existing items
    const storedItems = await AsyncStorage.getItem(`bucketList_${userId}`);
    if (storedItems) {
      let items = JSON.parse(storedItems);
      console.log('Existing items:', items);
      
      // Filter out the item to remove
      const oldLength = items.length;
      items = items.filter(item => item.id !== itemId);
      console.log(`Removed ${oldLength - items.length} items`);
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem(`bucketList_${userId}`, JSON.stringify(items));
      console.log('Successfully saved updated items to AsyncStorage');
    } else {
      console.log('No existing items found');
    }
  } catch (error) {
    console.error('Error deleting from AsyncStorage:', error);
  }
}

/**
 * Handle mark as visited
 * Marks a bucket list item as visited
 */
function* handleMarkAsVisited(action: PayloadAction<{
  id: string;
  rating?: number;
  review?: string;
}>) {
  try {
    console.log('Marking as visited:', action.payload);
    const userId = yield select(getUserId);
    const { id, rating, review } = action.payload;
    
    // Get current item from state
    const state: RootState = yield select();
    const currentItem = state.bucketList.items.find(item => item.id === id);
    
    if (!currentItem) {
      throw new Error('Item not found');
    }
    
    // Create updated item
    const updatedItem: BucketListItem = {
      ...currentItem,
      visitedAt: Date.now(),
      rating,
      review
    };
    
    // Save to AsyncStorage
    yield call(updateBucketListItemInStorage, updatedItem);
    
    // Handle success
    yield put(markAsVisitedSuccess(updatedItem));
    console.log('Mark as visited success action dispatched');
  } catch (error) {
    console.error('Failed to mark as visited:', error);
    yield put(markAsVisitedFailure(error.message || 'Failed to mark as visited'));
  }
}

/**
 * Watch for bucket list actions
 */
export function* watchBucketList() {
  console.log('Setting up bucket list saga watchers');
  yield takeLatest(fetchBucketList.type, handleFetchBucketList);
  yield takeLatest(addToBucketList.type, handleAddToBucketList);
  yield takeLatest(updateBucketListItem.type, handleUpdateBucketListItem);
  yield takeLatest(removeFromBucketList.type, handleRemoveFromBucketList);
  yield takeLatest(markAsVisited.type, handleMarkAsVisited);
}