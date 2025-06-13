import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BucketListState, BucketListItem, BucketListFilter } from '../../models/bucket-list';

// Initial state for the bucket list
const initialState: BucketListState = {
  items: [],
  filteredItems: [],
  filters: {},
  loading: false,
  error: null,
};

/**
 * Bucket List Slice
 * Manages bucket list items, filtering, and loading states
 */
const bucketListSlice = createSlice({
  name: 'bucketList',
  initialState,
  reducers: {
    // Fetch bucket list actions
    fetchBucketList: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBucketListSuccess: (state, action: PayloadAction<BucketListItem[]>) => {
      state.items = action.payload;
      state.filteredItems = applyFilters(action.payload, state.filters);
      state.loading = false;
    },
    fetchBucketListFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Add to bucket list actions
    addToBucketList: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    addToBucketListSuccess: (state, action: PayloadAction<BucketListItem>) => {
      // Only add if not already in the list
      if (!state.items.some(item => item.id === action.payload.id)) {
        state.items.push(action.payload);
        state.filteredItems = applyFilters(state.items, state.filters);
      }
      state.loading = false;
    },
    addToBucketListFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Update bucket list item actions 
    updateBucketListItem: (state, action: PayloadAction<BucketListItem>) => {
      state.loading = true;
      state.error = null;
    },
    updateBucketListItemSuccess: (state, action: PayloadAction<BucketListItem>) => {
      const updatedItem = action.payload;
      const index = state.items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        state.items[index] = updatedItem;
        state.filteredItems = applyFilters(state.items, state.filters);
      }
      state.loading = false;
    },
    updateBucketListItemFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Remove from bucket list actions
    removeFromBucketList: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    removeFromBucketListSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.filteredItems = applyFilters(state.items, state.filters);
      state.loading = false;
    },
    removeFromBucketListFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Mark as visited actions
    markAsVisited: (state, action: PayloadAction<{
      id: string;
      rating?: number;
      review?: string;
    }>) => {
      state.loading = true;
      state.error = null;
    },
    markAsVisitedSuccess: (state, action: PayloadAction<BucketListItem>) => {
      const updatedItem = action.payload;
      const index = state.items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        state.items[index] = updatedItem;
        state.filteredItems = applyFilters(state.items, state.filters);
      }
      state.loading = false;
    },
    markAsVisitedFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Filter actions
    setFilters: (state, action: PayloadAction<BucketListFilter>) => {
      state.filters = action.payload;
      state.filteredItems = applyFilters(state.items, action.payload);
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredItems = state.items;
    },
  },
});

/**
 * Helper function to apply filters to bucket list items
 */
const applyFilters = (items: BucketListItem[], filters: BucketListFilter): BucketListItem[] => {
  let result = [...items];
  
  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(item => 
      item.tags && item.tags.some(tag => filters.tags!.includes(tag))
    );
  }
  
  // Filter by priority
  if (filters.priority && filters.priority.length > 0) {
    result = result.filter(item => 
      item.priority && filters.priority!.includes(item.priority)
    );
  }
  
  // Filter by visited status
  if (filters.visited !== undefined) {
    result = result.filter(item => 
      filters.visited ? !!item.visitedAt : !item.visitedAt
    );
  }
  
  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    result = result.filter(item => 
      item.venue.name.toLowerCase().includes(term) || 
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  }
  
  // Sort results
  if (filters.sortBy) {
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'dateAdded':
          comparison = a.addedAt - b.addedAt;
          break;
        case 'name':
          comparison = a.venue.name.localeCompare(b.venue.name);
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const aPriority = a.priority ? priorityOrder[a.priority] : 3;
          const bPriority = b.priority ? priorityOrder[b.priority] : 3;
          comparison = aPriority - bPriority;
          break;
        case 'plannedDate':
          const aDate = a.plannedVisitDate || Number.MAX_SAFE_INTEGER;
          const bDate = b.plannedVisitDate || Number.MAX_SAFE_INTEGER;
          comparison = aDate - bDate;
          break;
        default:
          break;
      }
      
      // Apply sort direction
      return filters.sortDirection === 'desc' ? -comparison : comparison;
    });
  }
  
  return result;
};

// Export all actions
export const {
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
  markAsVisitedFailure,
  setFilters,
  clearFilters,
} = bucketListSlice.actions;

// Export reducer
export default bucketListSlice.reducer;