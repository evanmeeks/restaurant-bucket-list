import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Share,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from 'core/src/store';
import { selectVenue } from 'core/src/store/slices/venuesSlice';
import {
  addToBucketList,
  removeFromBucketList,
  updateBucketListItem,
  markAsVisited,
} from 'core/src/store/slices/bucketListSlice';
import { theme } from '../../theme';
import { getVenueImage } from '../../utils/imageUtils';
import { getDistanceString } from '../../utils/distanceUtils';
import { RootStackParamList } from '../../navigation/types';
import { BucketListItemForm } from '../forms/BucketListItemForm';

type VenueDetailsScreenRouteProp = RouteProp<RootStackParamList, 'VenueDetails'>;
type VenueDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VenueDetails'>;

export const VenueDetailsScreen: React.FC = () => {
  const route = useRoute<VenueDetailsScreenRouteProp>();
  const navigation = useNavigation<VenueDetailsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { venueId } = route.params;
  const venue = useAppSelector(state => state.venues.selectedVenue);
  const userLocation = useAppSelector(state => state.venues.userLocation);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const bucketListItems = useAppSelector(state => state.bucketList.items);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [visitedModalVisible, setVisitedModalVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');

  const bucketListItem = useMemo(() => {
    return bucketListItems.find(item => item.venueId === venueId);
  }, [bucketListItems, venueId]);

  const isBucketListed = !!bucketListItem;

  const mainImage = useMemo(() => {
    return getVenueImage(venue, 600, 400);
  }, [venue]);

  const distance = useMemo(() => {
    if (userLocation && venue?.location) {
      return getDistanceString(
        userLocation.latitude,
        userLocation.longitude,
        venue.location.lat,
        venue.location.lng
      );
    }
    return null;
  }, [userLocation, venue?.location]);

  useEffect(() => {
    const loadVenue = async () => {
      setIsLoading(true);
      await dispatch(selectVenue(venueId));
      setIsLoading(false);
    };

    if (venueId) {
      loadVenue();
    }
  }, [dispatch, venueId]);

  useEffect(() => {
    if (venue) {
      navigation.setOptions({
        title: venue.name,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleShare}
            style={{ marginRight: 16 }}
            accessibilityLabel="Share this venue"
            accessibilityRole="button"
          >
            <Icon name="share" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, venue]);

  const handleBucketListToggle = useCallback(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    if (isBucketListed) {
      dispatch(removeFromBucketList(bucketListItem!.id));
    } else {
      setFormVisible(true);
    }
  }, [dispatch, isAuthenticated, isBucketListed, bucketListItem, navigation]);

  const handleEditBucketList = useCallback(() => {
    if (bucketListItem) {
      setFormVisible(true);
    }
  }, [bucketListItem]);

  const handleFormSubmit = useCallback(
    (data: {
      notes?: string;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      plannedVisitDate?: Date;
    }) => {
      if (isBucketListed && bucketListItem) {
        dispatch(
          updateBucketListItem({
            id: bucketListItem.id,
            updates: {
              ...data,
              plannedVisitDate: data.plannedVisitDate?.getTime(),
            },
          })
        );
      } else {
        dispatch(
          addToBucketList({
            venueId,
            ...data,
            plannedVisitDate: data.plannedVisitDate?.getTime(),
          })
        );
      }

      setFormVisible(false);
    },
    [dispatch, venueId, isBucketListed, bucketListItem]
  );

  const handleMarkAsVisited = useCallback(() => {
    setVisitedModalVisible(true);
  }, []);

  const handleVisitedSubmit = useCallback(() => {
    if (bucketListItem) {
      dispatch(
        markAsVisited({
          id: bucketListItem.id,
          rating,
          review: review.trim() || undefined,
        })
      );
      setVisitedModalVisible(false);
    }
  }, [dispatch, bucketListItem, rating, review]);

  const handleDirections = useCallback(() => {
    if (!venue?.location) return;

    const { lat, lng } = venue.location;
    const url = Platform.select({
      ios: `maps:?q=${venue.name}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${venue.name})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  }, [venue]);

  const handleOpenWebsite = useCallback(() => {
    if (venue?.url) {
      Linking.openURL(venue.url);
    }
  }, [venue?.url]);

  const handleCall = useCallback(() => {
    if (venue?.contact?.phone) {
      Linking.openURL(`tel:${venue.contact.phone}`);
    }
  }, [venue?.contact?.phone]);

  const handleShare = useCallback(() => {
    if (!venue) return;

    const title = `Check out ${venue.name}`;
    const message = `I found ${venue.name} and thought you might be interested!\n${
      venue.location?.formattedAddress || ''
    }`;
    const url = venue.url;

    Share.share({
      title,
      message: url ? `${message}\n${url}` : message,
    });
  }, [venue]);

  if (isLoading || !venue) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    );
  }

  const categoryText = venue.categories?.map(cat => cat.name).join(', ') || '';
  const priceText = venue.price?.message || (venue.price?.tier ? '$'.repeat(venue.price.tier) : '');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {mainImage ? (
          <Image source={{ uri: mainImage }} style={styles.mainImage} />
        ) : (
          <View style={[styles.mainImage, styles.placeholderImage]}>
            <Icon name="restaurant" size={60} color={theme.colors.grey3} />
          </View>
        )}
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{venue.name}</Text>
            {venue.rating ? (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
                <Icon name="star" size={16} color={theme.colors.warning} />
              </View>
            ) : null}
          </View>
          {categoryText ? <Text style={styles.category}>{categoryText}</Text> : null}
          <View style={styles.tagsContainer}>
            {priceText ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{priceText}</Text>
              </View>
            ) : null}
            {distance ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{distance}</Text>
              </View>
            ) : null}
            {venue.hours?.isOpen !== undefined && (
              <View
                style={[
                  styles.chip,
                  { borderColor: venue.hours.isOpen ? theme.colors.success : theme.colors.error },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: venue.hours.isOpen ? theme.colors.success : theme.colors.error },
                  ]}
                >
                  {venue.hours.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            )}
          </View>
          {venue.hours?.displayHours && venue.hours.displayHours.length > 0 && (
            <View style={styles.hoursContainer}>
              <Text style={styles.sectionTitle}>Hours</Text>
              {venue.hours.displayHours.map((hour, index) => (
                <Text key={index} style={styles.hourText}>
                  {hour}
                </Text>
              ))}
            </View>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isBucketListed ? styles.solidButton : styles.outlineButton,
            ]}
            onPress={handleBucketListToggle}
          >
            <Icon
              name={isBucketListed ? 'bookmark' : 'bookmark-outline'}
              type="material-community"
              color={isBucketListed ? 'white' : theme.colors.primary}
              size={20}
            />
            <Text
              style={[
                styles.actionButtonText,
                isBucketListed ? styles.solidButtonText : styles.outlineButtonText,
              ]}
            >
              {isBucketListed ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Icon name="directions" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          {venue.contact?.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Icon name="phone" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>
        {isBucketListed && (
          <View style={styles.bucketListActionsContainer}>
            <TouchableOpacity style={styles.smallButton} onPress={handleEditBucketList}>
              <Icon name="edit" size={16} color={theme.colors.primary} />
              <Text style={styles.smallButtonText}>Edit Details</Text>
            </TouchableOpacity>
            {!bucketListItem?.visitedAt && (
              <TouchableOpacity style={styles.smallButton} onPress={handleMarkAsVisited}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.smallButtonText, { color: theme.colors.success }]}>
                  Mark as Visited
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={styles.divider} />
        {venue.location?.formattedAddress && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressContainer}>
              <Icon name="place" size={20} color={theme.colors.grey3} />
              <Text style={styles.address}>
                {typeof venue.location.formattedAddress === 'string'
                  ? venue.location.formattedAddress
                  : venue.location.formattedAddress.join(', ')}
              </Text>
            </View>
          </View>
        )}
        {venue.location?.lat && venue.location?.lng && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: venue.location.lat,
                longitude: venue.location.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: venue.location.lat,
                  longitude: venue.location.lng,
                }}
                title={venue.name}
                description={categoryText}
              />
            </MapView>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={handleDirections}
              accessible={true}
              accessibilityLabel="Get directions to this venue"
              accessibilityRole="button"
            >
              <Text style={styles.directionsButtonText}>Directions</Text>
              <Icon name="directions" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
        {isBucketListed && bucketListItem?.notes && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            <Text style={styles.notes}>{bucketListItem.notes}</Text>
          </View>
        )}
        {isBucketListed && bucketListItem?.visitedAt && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Visit</Text>
            <Text style={styles.visitedDate}>
              Visited on {new Date(bucketListItem.visitedAt).toLocaleDateString()}
            </Text>
            {bucketListItem.rating && (
              <View style={styles.userRatingContainer}>
                <Text style={styles.userRatingLabel}>Your Rating: </Text>
                <View style={styles.userRatingStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={20}
                      color={i < bucketListItem.rating! ? theme.colors.warning : theme.colors.grey4}
                    />
                  ))}
                </View>
              </View>
            )}
            {bucketListItem.review && (
              <View style={styles.reviewContainer}>
                <Text style={styles.reviewLabel}>Your Review:</Text>
                <Text style={styles.review}>{bucketListItem.review}</Text>
              </View>
            )}
          </View>
        )}
        {venue.description && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>
        )}
        {venue.url && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Website</Text>
            <TouchableOpacity
              onPress={handleOpenWebsite}
              style={styles.websiteButton}
              accessible={true}
              accessibilityLabel="Visit website"
              accessibilityRole="button"
            >
              <Text style={styles.websiteButtonText}>{venue.url}</Text>
              <Icon name="open-in-new" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        {(venue.contact?.phone || venue.contact?.formattedPhone) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <TouchableOpacity
              onPress={handleCall}
              style={styles.contactButton}
              accessible={true}
              accessibilityLabel={`Call ${venue.name}`}
              accessibilityRole="button"
            >
              <Icon name="phone" size={20} color={theme.colors.primary} />
              <Text style={styles.contactButtonText}>
                {venue.contact.formattedPhone || venue.contact.phone}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
      <Modal
        visible={formVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.formOverlay}>
          <BucketListItemForm
            venueId={venueId}
            initialData={
              isBucketListed
                ? {
                    notes: bucketListItem?.notes,
                    tags: bucketListItem?.tags,
                    priority: bucketListItem?.priority,
                    plannedVisitDate: bucketListItem?.plannedVisitDate
                      ? new Date(bucketListItem.plannedVisitDate)
                      : undefined,
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={() => setFormVisible(false)}
          />
        </View>
      </Modal>
      <Modal
        visible={visitedModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisitedModalVisible(false)}
      >
        <View style={styles.formOverlay}>
          <View style={styles.visitedForm}>
            <Text style={styles.formTitle}>Mark as Visited</Text>
            <Text style={styles.formLabel}>How would you rate your experience?</Text>
            <View style={styles.ratingInputContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setRating(i + 1)}
                  style={styles.ratingButton}
                  accessible={true}
                  accessibilityLabel={`Rate ${i + 1} stars`}
                  accessibilityRole="button"
                >
                  <Icon
                    name="star"
                    size={32}
                    color={i < rating ? theme.colors.warning : theme.colors.grey4}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.formLabel}>Add a review (optional)</Text>
            <TextInput
              style={styles.reviewInput}
              value={review}
              onChangeText={setReview}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.outlineButton]}
                onPress={() => setVisitedModalVisible(false)}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.formButton,
                  rating === 0 ? styles.disabledButton : styles.solidButton,
                ]}
                onPress={handleVisitedSubmit}
                disabled={rating === 0}
              >
                <Text style={styles.solidButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={handleBucketListToggle}
        accessible={true}
        accessibilityLabel={isBucketListed ? 'Remove from bucket list' : 'Add to bucket list'}
        accessibilityRole="button"
      >
        <Icon
          name={isBucketListed ? 'bookmark' : 'bookmark-outline'}
          type="material-community"
          color="white"
          size={24}
        />
        <Text style={styles.fabText}>{isBucketListed ? 'Saved' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContainer: { flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: theme.colors.grey3 },
  mainImage: { width: '100%', height: 250 },
  placeholderImage: {
    backgroundColor: theme.colors.grey5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: { padding: 16 },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 8 },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.grey5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: { fontSize: 16, fontWeight: 'bold', marginRight: 2 },
  category: { fontSize: 16, color: theme.colors.grey3, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.grey4,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: { fontSize: 14, color: theme.colors.grey2 },
  hoursContainer: { marginTop: 8 },
  hourText: { fontSize: 14, marginBottom: 2, color: theme.colors.grey2 },
  divider: { height: 1, backgroundColor: theme.colors.grey4, marginVertical: 8 },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    marginHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    minWidth: 100,
  },
  actionButtonText: { fontSize: 14, color: theme.colors.primary, marginLeft: 8 },
  solidButton: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  outlineButton: { backgroundColor: 'transparent', borderColor: theme.colors.primary },
  solidButtonText: { color: 'white' },
  outlineButtonText: { color: theme.colors.primary },
  bucketListActionsContainer: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallButtonText: { fontSize: 12, marginLeft: 4 },
  sectionContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.colors.grey1 },
  addressContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  address: { fontSize: 16, flex: 1, marginLeft: 8, color: theme.colors.grey2 },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: { ...StyleSheet.absoluteFillObject },
  directionsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  directionsButtonText: { color: 'white', fontWeight: 'bold', marginRight: 4 },
  notes: {
    fontSize: 16,
    color: theme.colors.grey2,
    backgroundColor: theme.colors.grey5,
    padding: 12,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  visitedDate: { fontSize: 16, color: theme.colors.grey2, marginBottom: 8 },
  userRatingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  userRatingLabel: { fontSize: 16, color: theme.colors.grey2 },
  userRatingStars: { flexDirection: 'row', marginLeft: 8 },
  reviewContainer: { marginTop: 8 },
  reviewLabel: { fontSize: 16, color: theme.colors.grey2, marginBottom: 4 },
  review: {
    fontSize: 16,
    color: theme.colors.grey2,
    backgroundColor: theme.colors.grey5,
    padding: 12,
    borderRadius: 8,
  },
  description: { fontSize: 16, color: theme.colors.grey2, lineHeight: 22 },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.grey5,
    padding: 12,
    borderRadius: 8,
  },
  websiteButtonText: { fontSize: 16, color: theme.colors.primary, flex: 1 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.grey5,
    padding: 12,
    borderRadius: 8,
  },
  contactButtonText: { fontSize: 16, color: theme.colors.primary, marginLeft: 8 },
  formOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  visitedForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  formLabel: { fontSize: 16, marginBottom: 8, color: theme.colors.grey1 },
  ratingInputContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  ratingButton: { padding: 8 },
  reviewInput: {
    borderWidth: 1,
    borderColor: theme.colors.grey4,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
  },
  formButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  formButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  disabledButton: { backgroundColor: theme.colors.grey4, borderColor: theme.colors.grey4 },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
  },
  fabText: { color: 'white', fontSize: 14, marginLeft: 8 },
});
