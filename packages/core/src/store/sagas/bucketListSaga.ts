import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
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

// Helper function to get user ID from state
const getUserId = (state: RootState) => state.auth.user?.id;

// Handle fetch bucket list
function* handleFetchBucketList() {
  try {
    const userId = yield select(getUserId);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Call API to get user's bucket list
    // In a real app, this would be a call to your backend API
    // or a service like Firebase
    const items = yield call(fetchBucketListFromFirebase, userId);
    
    // Enhance items with venue details if needed
    const enhancedItems = yield call(enhanceBucketListWithVenueDetails, items);
    
    // Handle success
    yield put(fetchBucketListSuccess(enhancedItems));
  } catch (error) {
    console.error('Failed to fetch bucket list:', error);
    yield put(fetchBucketListFailure(error.message || 'Failed to fetch bucket list'));
  }
}

// Mock function to fetch bucket list from Firebase or backend
// This would be replaced with actual Firebase calls
function fetchBucketListFromFirebase(userId: string): Promise<BucketListItem[]> {
  // In a real implementation, this would be:
  // return firebaseService.getBucketList(userId);
  
  // For now, return mock data
  return Promise.resolve([]);
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

// Handle add to bucket list
function* handleAddToBucketList(action: PayloadAction<{
  venueId: string;
  notes?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}>) {
  try {
    const userId = yield select(getUserId);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { venueId, notes, tags, priority } = action.payload;
    
    // Get venue details if not already in state
    let venue: Venue;
    const state: RootState = yield select();
    
    // Check if venue is in state
    const venueInState = 
      state.venues.nearby.venues.find(v => v.id === venueId) ||
      state.venues.recommended.venues.find(v => v.id === venueId) ||
      state.venues.search.venues.find(v => v.id === venueId) ||
      (state.venues.selectedVenue?.id === venueId ? state.venues.selectedVenue : undefined);
      
    if (venueInState) {
      venue = venueInState;
    } else {
      // Fetch venue details from API
      const response = yield call(
        foursquareService.getVenueDetails.bind(foursquareService),
        venueId
      );
      venue = response.venue;
      
      // Also update selected venue in state
      yield put(selectVenue(venueId));
    }
    
    // Create bucket list item
    const newItem: BucketListItem = {
      id: `${userId}_${venueId}_${Date.now()}`, // Generate a unique ID
      venueId,
      venue,
      userId,
      notes,
      tags,
      priority,
      addedAt: Date.now()
    };
    
    // Save to Firebase or backend
    yield call(saveBucketListItemToFirebase, newItem);
    
    // Handle success
    yield put(addToBucketListSuccess(newItem));
  } catch (error) {
    console.error('Failed to add to bucket list:', error);
    yield put(addToBucketListFailure(error.message || 'Failed to add to bucket list'));
  }
}

// Mock function to save bucket list item to Firebase or backend
function saveBucketListItemToFirebase(item: BucketListItem): Promise<void> {
  // In a real implementation, this would be:
  // return firebaseService.saveBucketListItem(item);
  
  // For now, just return a resolved promise
  return Promise.resolve();
}

// Handle update bucket list item
function* handleUpdateBucketListItem(action: PayloadAction<{
  id: string;
  updates: Partial<BucketListItem>;
}>) {
  try {
    const userId = yield select(getUserId);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { id, updates } = action.payload;
    
    // Get current item from state
    const state: RootState = yield select();
    const currentItem = state.bucketList.items.find(item => item.id === id);
    
    if (!currentItem) {
      throw new Error('Item not found');
    }
    
    // Create updated item
    const updatedItem: BucketListItem = {
      ...currentItem,
      ...updates
    };
    
    // Save to Firebase or backend
    yield call(updateBucketListItemInFirebase, updatedItem);
    
    // Handle success
    yield put(updateBucketListItemSuccess(updatedItem));
  } catch (error) {
    console.error('Failed to update bucket list item:', error);
    yield put(updateBucketListItemFailure(error.message || 'Failed to update bucket list item'));
  }
}

// Mock function to update bucket list item in Firebase or backend
function updateBucketListItemInFirebase(item: BucketListItem): Promise<void> {
  // In a real implementation, this would be:
  // return firebaseService.updateBucketListItem(item);
  
  // For now, just return a resolved promise
  return Promise.resolve();
}

// Handle remove from bucket list
function* handleRemoveFromBucketList(action: PayloadAction<string>) {
  try {
    const userId = yield select(getUserId);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const itemId = action.payload;
    
    // Delete from Firebase or backend
    yield call(deleteBucketListItemFromFirebase, itemId);
    
    // Handle success
    yield put(removeFromBucketListSuccess(itemId));
  } catch (error) {
    console.error('Failed to remove from bucket list:', error);
    yield put(removeFromBucketListFailure(error.message || 'Failed to remove from bucket list'));
  }
}

// Mock function to delete bucket list item from Firebase or backend
function deleteBucketListItemFromFirebase(itemId: string): Promise<void> {
  // In a real implementation, this would be:
  // return firebaseService.deleteBucketListItem(itemId);
  
  // For now, just return a resolved promise
  return Promise.resolve();
}

// Handle mark as visited
function* handleMarkAsVisited(action: PayloadAction<{
  id: string;
  rating?: number;
  review?: string;
}>) {
  try {
    const userId = yield select(getUserId);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
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
    
    // Save to Firebase or backend
    yield call(updateBucketListItemInFirebase, updatedItem);
    
    // Handle success
    yield put(markAsVisitedSuccess(updatedItem));
  } catch (error) {
    console.error('Failed to mark as visited:', error);
    yield put(markAsVisitedFailure(error.message || 'Failed to mark as visited'));
  }
}

// Watch for bucket list actions
export function* watchBucketList() {
  yield takeLatest(fetchBucketList.type, handleFetchBucketList);
  yield takeLatest(addToBucketList.type, handleAddToBucketList);
  yield takeLatest(updateBucketListItem.type, handleUpdateBucketListItem);
  yield takeLatest(removeFromBucketList.type, handleRemoveFromBucketList);
  yield takeLatest(markAsVisited.type, handleMarkAsVisited);
}
