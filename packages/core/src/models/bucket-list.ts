import { Venue } from './venue';

/**
 * User-specific bucket list item with additional metadata
 */
export interface BucketListItem {
  id: string;
  venueId: string;
  venue: Venue;
  userId: string;
  notes?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  addedAt: number;
  plannedVisitDate?: number;
  visitedAt?: number;
  rating?: number;
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
