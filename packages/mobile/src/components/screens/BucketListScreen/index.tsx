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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from 'core/src/store';
import {
  removeFromBucketList,
  markAsVisited,
  updateBucketListItem,
  fetchBucketList,
} from 'core/src/store/slices/bucketListSlice';
import { BucketListNavigationProp } from '../../../navigation/types';
import { BucketListItem } from 'core/src/models/bucket-list';
// Debug imports removed - hooks don't exist
import { useBucketListDebugger, useActionDebugger } from '../../debug/hooks';
import ReduxDebugPanel from '../../debug/ReduxDebugPanel';
// Default image when venue has no photo
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x100?text=No+Image';

// Priority options for bucket list items
const PRIORITY_OPTIONS = ['high', 'medium', 'low', 'none'];

/**
 * Edit Modal Component for inline editing of bucket list items
 */
interface EditModalProps {
  item: BucketListItem | null;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedItem: BucketListItem) => void;
}

const EditModal: React.FC<EditModalProps> = ({ item, visible, onClose, onSave }) => {
  // Return null if no item is provided
  if (!item) return null;

  // State for form fields
  const [notes, setNotes] = useState<string>(item.notes || '');
  const [priority, setPriority] = useState<string>(item.priority || 'none');
  const [tags, setTags] = useState<string>(item.tags ? item.tags.join(', ') : '');
  const [plannedDate, setPlannedDate] = useState<string>(
    item.plannedVisitDate ? new Date(item.plannedVisitDate).toISOString().split('T')[0] : ''
  );

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setNotes(item.notes || '');
      setPriority(item.priority || 'none');
      setTags(item.tags ? item.tags.join(', ') : '');
      setPlannedDate(
        item.plannedVisitDate ? new Date(item.plannedVisitDate).toISOString().split('T')[0] : ''
      );
    }
  }, [item]);

  // Handle saving the edited item
  const handleSave = () => {
    // Parse tags from comma-separated string
    const tagsList = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Create updated item
    const updatedItem: BucketListItem = {
      ...item,
      notes,
      priority: priority === 'none' ? undefined : (priority as 'high' | 'medium' | 'low'),
      tags: tagsList,
      plannedVisitDate: plannedDate ? new Date(plannedDate).getTime() : undefined,
    };

    onSave(updatedItem);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Bucket List Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Restaurant Name</Text>
            <Text style={styles.restaurantName}>{item.venue.name}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this place..."
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Priority</Text>
            <View style={styles.priorityContainer}>
              {PRIORITY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.priorityOption,
                    priority === option && option !== 'none' && styles[`${option}Priority`],
                    priority === option && styles.selectedPriority,
                  ]}
                  onPress={() => setPriority(option)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === option && option !== 'none' && styles.selectedPriorityText,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.textInput}
              value={tags}
              onChangeText={setTags}
              placeholder="e.g. Mexican, Brunch, Outdoor Seating"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Planned Visit Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={plannedDate}
              onChangeText={setPlannedDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Bucket List Item Component
 * Displays a single bucket list item with actions
 */
interface BucketListItemProps {
  item: BucketListItem;
  onRemove: (id: string) => void;
  onMarkVisited: (id: string) => void;
  onSelect: (item: BucketListItem) => void;
  onEdit: (item: BucketListItem) => void;
}

const BucketListItemComponent: React.FC<BucketListItemProps> = ({
  item,
  onRemove,
  onMarkVisited,
  onSelect,
  onEdit,
}) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onSelect(item)}>
      <View style={styles.imageContainer}>
        {item.venue.photo ? (
          <Image source={{ uri: item.venue.photo }} style={styles.image} />
        ) : (
          <Image source={{ uri: DEFAULT_IMAGE }} style={styles.image} />
        )}
        {item.priority && (
          <View
            style={[
              styles.priorityBadge,
              item.priority === 'high'
                ? styles.highPriority
                : item.priority === 'medium'
                ? styles.mediumPriority
                : styles.lowPriority,
            ]}
          >
            <Ionicons name="flag" size={12} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.nameText}>{item.venue.name}</Text>
        <Text style={styles.categoryText}>{item.venue.category}</Text>
        <Text style={styles.addressText} numberOfLines={1}>
          {item.venue.address}
        </Text>

        {item.visitedAt ? (
          <View style={styles.visitedContainer}>
            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
            <Text style={styles.visitedText}>
              Visited on {new Date(item.visitedAt).toLocaleDateString()}
            </Text>
          </View>
        ) : item.plannedVisitDate ? (
          <View style={styles.plannedContainer}>
            <Ionicons name="calendar" size={14} color="#2196F3" />
            <Text style={styles.plannedText}>
              Planned for {new Date(item.plannedVisitDate).toLocaleDateString()}
            </Text>
          </View>
        ) : null}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
            )}
          </View>
        )}

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={1}>
            Note: {item.notes}
          </Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {!item.visitedAt && (
          <TouchableOpacity style={styles.actionButton} onPress={() => onMarkVisited(item.id)}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={22} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onRemove(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

/**
 * BucketListScreen Component
 * Displays the user's bucket list and handles interactions
 */
export const BucketListScreen: React.FC = () => {
  const navigation = useNavigation<BucketListNavigationProp>();
  const dispatch = useDispatch();

  // Get the bucket list items and loading state from Redux store
  const items = useAppSelector(state => state.bucketList.items);
  const loading = useAppSelector(state => state.bucketList.loading);
  const error = useAppSelector(state => state.bucketList.error);

  // Debug hooks removed - they don't exist and were causing issues
  const debugInfo = useBucketListDebugger();
  const { logAction, logAsyncAction } = useActionDebugger();

  // State for edit modal
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentEditItem, setCurrentEditItem] = useState<BucketListItem | null>(null);

  // Fetch bucket list on mount
  useEffect(() => {
    if (__DEV__) console.log('🪣 Fetching bucket list on mount');
    dispatch(fetchBucketList());
  }, [dispatch]);

  // Debug effect to track state changes
  useEffect(() => {
    if (__DEV__) {
      console.log('🪣 BucketListScreen: Items count changed to', items.length);
      if (items.length > 0) {
        console.log(
          'Items:',
          items.map(item => item.venue.name)
        );
      }
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
            if (__DEV__) console.log('🗑️ Removing from bucket list:', id);
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
          if (__DEV__) console.log('✅ Marking as visited:', id);
          dispatch(markAsVisited({ id }));
        },
      },
    ]);
  };

  // Handle selecting an item (navigate to detail screen)
  const handleSelectItem = (item: BucketListItem) => {
    navigation.navigate('Detail', { itemData: item.venue });
  };

  // Handle editing an item
  const handleEditItem = (item: BucketListItem) => {
    if (__DEV__) logAction('editItem', { itemId: item.id });
    setCurrentEditItem(item);
    setEditModalVisible(true);
  };

  // Handle saving edited item
  const handleSaveEdit = (updatedItem: BucketListItem) => {
    if (__DEV__) logAction('updateBucketListItem', updatedItem);
    dispatch(updateBucketListItem(updatedItem));
    setEditModalVisible(false);
    setCurrentEditItem(null);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setCurrentEditItem(null);
  };

  // If we're fetching data for the first time, show loading indicator
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
        {/* Debug Panel */}
        <ReduxDebugPanel />
      </SafeAreaView>
    );
  }

  // If there's an error and no items, show error state
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
            onPress={() => {
              if (__DEV__) logAction('retryFetchBucketList');
              dispatch(fetchBucketList());
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        {/* Debug Panel */}
        <ReduxDebugPanel />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bucket List</Text>
        <Text style={styles.subtitle}>{items.length} restaurants saved</Text>
        {__DEV__ && (
          <Text style={styles.debugInfo}>
            Dbug: {debugInfo.isLoading ? 'Loading...' : `${debugInfo.itemsCount} items`}
          </Text>
        )}
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
            <BucketListItemComponent
              item={item}
              onRemove={handleRemoveItem}
              onMarkVisited={handleMarkVisited}
              onSelect={handleSelectItem}
              onEdit={handleEditItem}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
            if (__DEV__) logAction('pullToRefresh');
            dispatch(fetchBucketList());
          }}
        />
      )}

      {/* Edit Modal */}
      <EditModal
        item={currentEditItem}
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* Debug Panel - Only shows in development */}
      <ReduxDebugPanel />
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
  debugInfo: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 2,
    fontWeight: '500',
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
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  priorityBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highPriority: {
    backgroundColor: '#FF5252',
  },
  mediumPriority: {
    backgroundColor: '#FFC107',
  },
  lowPriority: {
    backgroundColor: '#8BC34A',
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
  notesText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  visitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  visitedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  plannedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plannedText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#666666',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999999',
    alignSelf: 'center',
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
  // Modal styles (same as before)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 6,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#F9F9F9',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPriority: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  priorityText: {
    fontSize: 12,
    color: '#555555',
  },
  selectedPriorityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default BucketListScreen;
