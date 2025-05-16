import { Coordinates } from './venue';

/**
 * Simplified venue model for bucket list items
 */
export interface BucketListVenue {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates?: Coordinates;
  photo?: string;
  rating?: number;
}

/**
 * User-specific bucket list item with additional metadata
 */
export interface BucketListItem {
  id: string;
  venue: BucketListVenue;
  notes?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  addedAt: number;
  plannedVisitDate?: number;
  visitedAt?: number;
  userRating?: number;
  review?: string;
}

/**
 * Filter options for bucket list
 */
export interface BucketListFilter {
  tags?: string[];
  priority?: ('low' | 'medium' | 'high')[];
  visited?: boolean;
  searchTerm?: string;
  sortBy?: 'dateAdded' | 'name' | 'priority' | 'plannedDate';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Bucket list state in the redux store
 */
export interface BucketListState {
  items: BucketListItem[];
  filteredItems: BucketListItem[];
  filters: BucketListFilter;
  loading: boolean;
  error: string | null;
}
