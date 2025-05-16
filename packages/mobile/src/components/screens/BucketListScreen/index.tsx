import React from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from 'core/src/store';
import { removeFromBucketList, markAsVisited } from 'core/src/store/slices/bucketListSlice';
import { BucketListNavigationProp } from '../../../navigation/types';
import { BucketListItem } from 'core/src/models/bucket-list';

// Default image when venue has no photo
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x100?text=No+Image';

interface BucketListItemProps {
  item: BucketListItem;
  onRemove: (id: string) => void;
  onMarkVisited: (id: string) => void;
  onSelect: (item: BucketListItem) => void;
}

// Bucket list item component
const BucketListItemComponent: React.FC<BucketListItemProps> = ({ 
  item, 
  onRemove, 
  onMarkVisited,
  onSelect 
}) => {
  return (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => onSelect(item)}
    >
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
                  : styles.lowPriority
            ]}
          >
            <Ionicons 
              name="flag" 
              size={12} 
              color="#fff" 
            />
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
      </View>
      
      <View style={styles.actionsContainer}>
        {!item.visitedAt && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onMarkVisited(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onRemove(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const BucketListScreen: React.FC = () => {
  const navigation = useNavigation<BucketListNavigationProp>();
  const dispatch = useDispatch();
  
  // Get the bucket list items from Redux store
  const items = useAppSelector(state => state.bucketList.items);
  
  // Handle removing an item from the bucket list
  const handleRemoveItem = (id: string) => {
    Alert.alert(
      "Remove Restaurant",
      "Are you sure you want to remove this restaurant from your bucket list?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => dispatch(removeFromBucketList(id))
        }
      ]
    );
  };
  
  // Handle marking an item as visited
  const handleMarkVisited = (id: string) => {
    Alert.alert(
      "Mark as Visited",
      "Have you visited this restaurant?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, I've been there!", 
          onPress: () => dispatch(markAsVisited({ id }))
        }
      ]
    );
  };
  
  // Handle selecting an item (would navigate to detail screen in the future)
  const handleSelectItem = (item: BucketListItem) => {
    Alert.alert(
      "Restaurant Selected",
      `You selected ${item.venue.name}. Detail view would open here.`,
      [{ text: "OK" }]
    );
    
    // Example of how you might navigate to a details screen:
    // navigation.navigate('Details', { itemData: item });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bucket List</Text>
        <Text style={styles.subtitle}>{items.length} restaurants saved</Text>
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BucketListItemComponent
              item={item}
              onRemove={handleRemoveItem}
              onMarkVisited={handleMarkVisited}
              onSelect={handleSelectItem}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
        shadowColor: "#000",
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
  listContainer: {
    padding: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
  }
});

export default BucketListScreen;
