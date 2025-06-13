// Debug hooks stubs - simple implementations for development
export const useBucketListDebugger = () => {
  return {
    isLoading: false,
    itemsCount: 0,
  };
};

export const useActionDebugger = () => {
  return {
    logAction: (action: string, data?: any) => {
      if (__DEV__) {
        console.log(`🎬 Action: ${action}`, data);
      }
    },
    logAsyncAction: (action: string, data?: any) => {
      if (__DEV__) {
        console.log(`🎬 Async Action: ${action}`, data);
      }
    },
  };
};
