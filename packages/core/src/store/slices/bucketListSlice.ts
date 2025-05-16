import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BucketListState, BucketListItem, BucketListFilter } from '../../models/bucket-list';

const initialState: BucketListState = {
  items: [],
  filteredItems: [],
  filters: {},
  loading: false,
  error: null,
};

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
      // Create a bucket list item from the venue
      const venue = action.payload;
      const now = Date.now();
      
      const newItem: BucketListItem = {
        id: venue.fsq_id, // Use the Foursquare venue ID as the item ID
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
        addedAt: now,
        notes: '',
        tags: [],
        priority: 'medium',
      };
      
      // Add to items array if not already there
      if (!state.items.some(item => item.id === newItem.id)) {
        state.items.push(newItem);
        state.filteredItems = applyFilters(state.items, state.filters);
      }
    },
    
    // Update bucket list item actions
    updateBucketListItem: (state, action: PayloadAction<{
      id: string;
      updates: Partial<BucketListItem>;
    }>) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
        state.filteredItems = applyFilters(state.items, state.filters);
      }
    },
    
    // Remove from bucket list actions
    removeFromBucketList: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.filteredItems = applyFilters(state.items, state.filters);
    },
    
    // Mark as visited actions
    markAsVisited: (state, action: PayloadAction<{
      id: string;
      rating?: number;
      review?: string;
    }>) => {
      const { id, rating, review } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          visitedAt: Date.now(),
          userRating: rating,
          review,
        };
        state.filteredItems = applyFilters(state.items, state.filters);
      }
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

// Helper function to apply filters
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

// Export actions
export const {
  fetchBucketList,
  fetchBucketListSuccess,
  fetchBucketListFailure,
  addToBucketList,
  updateBucketListItem,
  removeFromBucketList,
  markAsVisited,
  setFilters,
  clearFilters,
} = bucketListSlice.actions;

// Export reducer
export default bucketListSlice.reducer;
