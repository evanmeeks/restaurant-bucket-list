import { useEffect } from 'react';
import { useAppSelector } from 'core/src/store';

/**
 * Hook for debugging Redux state changes
 * Only active in development mode
 */
export const useReduxDebugger = (label: string = 'Redux State') => {
  const state = useAppSelector(state => state);
  
  useEffect(() => {
    if (__DEV__) {
      console.group(`🔍 ${label} Debug`);
      console.log('📊 Full State:', state);
      console.log('🪣 Bucket List:', state.bucketList);
      console.log('👤 Auth:', state.auth);
      console.log('🏢 Venues:', state.venues);
      console.log('🎨 UI:', state.ui);
      console.groupEnd();
    }
  }, [state, label]);

  // Return debug helpers
  return __DEV__ ? {
    logState: () => console.log(`${label} Current State:`, state),
    logBucketList: () => console.log('Bucket List State:', state.bucketList),
    logAuth: () => console.log('Auth State:', state.auth),
    logVenues: () => console.log('Venues State:', state.venues),
    logUI: () => console.log('UI State:', state.ui),
  } : {};
};

/**
 * Hook specifically for bucket list debugging
 */
export const useBucketListDebugger = () => {
  const bucketList = useAppSelector(state => state.bucketList);
  
  useEffect(() => {
    if (__DEV__) {
      console.group('🪣 Bucket List State Change');
      console.log('Items Count:', bucketList.items.length);
      console.log('Loading:', bucketList.loading);
      console.log('Error:', bucketList.error);
      console.log('Filtered Items:', bucketList.filteredItems.length);
      console.log('Items:', bucketList.items);
      console.groupEnd();
    }
  }, [bucketList]);

  return __DEV__ ? {
    itemsCount: bucketList.items.length,
    isLoading: bucketList.loading,
    hasError: !!bucketList.error,
    error: bucketList.error,
    items: bucketList.items,
  } : {};
};

/**
 * Hook for action debugging
 */
export const useActionDebugger = () => {
  if (!__DEV__) return {};

  return {
    logAction: (actionType: string, payload?: any) => {
      console.group(`🎬 Action: ${actionType}`);
      if (payload) console.log('Payload:', payload);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    },
    logAsyncAction: (actionType: string, stage: 'start' | 'success' | 'failure', payload?: any) => {
      const emoji = stage === 'start' ? '⏳' : stage === 'success' ? '✅' : '❌';
      console.group(`${emoji} Async Action: ${actionType} (${stage})`);
      if (payload) console.log('Payload:', payload);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    },
  };
};
