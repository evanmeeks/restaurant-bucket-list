import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from 'core/src/store';
import { 
  addToBucketList, 
  fetchBucketList, 
  removeFromBucketList,
  clearFilters
} from 'core/src/store/slices/bucketListSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Redux Debug Panel Component
 * Only renders in development mode
 * Provides real-time state monitoring and debugging tools
 */
export const ReduxDebugPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [storageData, setStorageData] = useState<any>(null);
  
  // Get current Redux state
  const bucketListState = useAppSelector(state => state.bucketList);
  const authState = useAppSelector(state => state.auth);
  const venuesState = useAppSelector(state => state.venues);
  const uiState = useAppSelector(state => state.ui);

  // Don't render in production
  if (!__DEV__) {
    return null;
  }

  const handleViewAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      const storageObj = {};
      stores.forEach(([key, value]) => {
        try {
          storageObj[key] = JSON.parse(value || '{}');
        } catch {
          storageObj[key] = value;
        }
      });
      setStorageData(storageObj);
    } catch (error) {
      Alert.alert('Error', 'Failed to read AsyncStorage');
    }
  };

  const handleClearBucketList = async () => {
    Alert.alert(
      'Clear Bucket List',
      'This will clear all bucket list data from AsyncStorage',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('bucketList_mock-user-1');
              dispatch(fetchBucketList());
              Alert.alert('Success', 'Bucket list cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear bucket list');
            }
          }
        }
      ]
    );
  };

  const handleAddTestItem = () => {
    const testVenue = {
      fsq_id: 'test-venue-' + Date.now(),
      name: 'Test Restaurant ' + Date.now(),
      categories: [{ name: 'Test Category' }],
      location: { 
        formatted_address: 'Test Address',
        lat: 30.2672,
        lng: -97.7431
      }
    };
    
    dispatch(addToBucketList(testVenue));
  };

  const handleRefreshBucketList = () => {
    dispatch(fetchBucketList());
  };

  return (
    <>
      {/* Debug Panel Toggle Button */}
      <TouchableOpacity
        style={styles.debugToggle}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="bug" size={24} color="#FF0000" />
      </TouchableOpacity>

      {/* Debug Panel Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.debugPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Redux Debug Panel</Text>
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleAddTestItem}>
                  <Text style={styles.actionButtonText}>Add Test Item</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleRefreshBucketList}>
                  <Text style={styles.actionButtonText}>Refresh List</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleViewAsyncStorage}>
                  <Text style={styles.actionButtonText}>View AsyncStorage</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearBucketList}>
                  <Text style={styles.actionButtonText}>Clear Bucket List</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bucket List State */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bucket List State</Text>
              <View style={styles.stateContainer}>
                <Text style={styles.stateLabel}>Items Count: {bucketListState.items.length}</Text>
                <Text style={styles.stateLabel}>Loading: {bucketListState.loading ? 'Yes' : 'No'}</Text>
                <Text style={styles.stateLabel}>Error: {bucketListState.error || 'None'}</Text>
                <Text style={styles.stateLabel}>Filtered Items: {bucketListState.filteredItems.length}</Text>
              </View>
              {bucketListState.items.length > 0 && (
                <View style={styles.itemsList}>
                  <Text style={styles.subSectionTitle}>Items:</Text>
                  {bucketListState.items.map((item, index) => (
                    <View key={item.id} style={styles.item}>
                      <Text style={styles.itemText}>{index + 1}. {item.venue.name}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => dispatch(removeFromBucketList(item.id))}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Auth State */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Auth State</Text>
              <View style={styles.stateContainer}>
                <Text style={styles.stateLabel}>Authenticated: {authState.isAuthenticated ? 'Yes' : 'No'}</Text>
                <Text style={styles.stateLabel}>User ID: {authState.user?.id || 'None'}</Text>
                <Text style={styles.stateLabel}>Email: {authState.user?.email || 'None'}</Text>
                <Text style={styles.stateLabel}>Loading: {authState.loading ? 'Yes' : 'No'}</Text>
                <Text style={styles.stateLabel}>Error: {authState.error || 'None'}</Text>
              </View>
            </View>

            {/* Venues State */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Venues State</Text>
              <View style={styles.stateContainer}>
                <Text style={styles.stateLabel}>Nearby: {venuesState.nearby?.venues?.length || 0}</Text>
                <Text style={styles.stateLabel}>Search: {venuesState.search?.venues?.length || 0}</Text>
                <Text style={styles.stateLabel}>Recommended: {venuesState.recommended?.venues?.length || 0}</Text>
                <Text style={styles.stateLabel}>Selected: {venuesState.selectedVenue?.name || 'None'}</Text>
              </View>
            </View>

            {/* AsyncStorage Data */}
            {storageData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AsyncStorage Data</Text>
                <ScrollView style={styles.jsonContainer}>
                  <Text style={styles.jsonText}>
                    {JSON.stringify(storageData, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  debugToggle: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  debugPanel: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  stateContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  stateLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemsList: {
    marginTop: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 4,
  },
  itemText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  jsonContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    maxHeight: 200,
  },
  jsonText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default ReduxDebugPanel;