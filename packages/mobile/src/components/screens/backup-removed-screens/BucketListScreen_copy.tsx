import {
  BucketListItem,
  removeFromBucketList,
  markAsVisited,
} from '@restaurant-bucket-list/core/src/store/slices/bucketListSlice';
import { RootState } from '@restaurant-bucket-list/core/src/store';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const BucketListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const bucketList = useSelector((state: RootState) => state.bucketList.items);

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove from Bucket List',
      'Are you sure you want to remove this restaurant from your bucket list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFromBucketList(id)),
        },
      ]
    );
  };

  const handleMarkAsVisited = (item: BucketListItem) => {
    Alert.alert('Mark as Visited', 'Would you like to rate this restaurant?', [
      {
        text: 'Skip',
        onPress: () => dispatch(markAsVisited({ id: item.fsq_id })),
      },
      {
        text: 'Rate',
        onPress: () => navigation.navigate('RestaurantDetails', { venue: item, markVisited: true }),
      },
    ]);
  };

  const renderBucketListItem = ({ item }: { item: BucketListItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('RestaurantDetails', { venue: item })}
    >
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemAddress, { color: theme.colors.text }]}>
          {item.location.address}
        </Text>
        {item.visited && (
          <View style={styles.visitedContainer}>
            <Icon name="check-circle" size={16} color={theme.colors.success} />
            <Text style={[styles.visitedText, { color: theme.colors.success }]}>
              Visited {new Date(item.dateVisited!).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.itemActions}>
        {!item.visited && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
            onPress={() => handleMarkAsVisited(item)}
          >
            <Icon name="check" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => handleRemoveItem(item.fsq_id)}
        >
          <Icon name="delete" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {bucketList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="restaurant" size={64} color={theme.colors.text} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Your bucket list is empty
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
            Add restaurants from the search or home screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={bucketList}
          renderItem={renderBucketListItem}
          keyExtractor={item => item.fsq_id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  visitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitedText: {
    fontSize: 12,
    marginLeft: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BucketListScreen;
