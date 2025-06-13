import { useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AddToBucketListRouteProp } from "../../navigation/types"; // Assuming types are in ../../navigation
import { theme } from "../../theme"; // Assuming theme is in ../../theme

// Placeholder component for AddToBucketListScreen
export const AddToBucketListScreen = () => {
  const route = useRoute<AddToBucketListRouteProp>();
  const { venueId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add To Bucket List Screen</Text>
      <Text style={styles.text}>Venue ID: {venueId}</Text>
      <Text style={styles.text}>
        (Placeholder: Implement form to add notes, priority, tags for the venue)
      </Text>
      {/* You would typically include the BucketListItemForm here */}
      {/* <BucketListItemForm venueId={venueId} onSubmit={...} onCancel={...} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.lightColors?.background || "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: theme.lightColors?.primary || "#000000",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: theme.lightColors?.grey1 || "#424242",
  },
});

// Export the component
export default AddToBucketListScreen;
