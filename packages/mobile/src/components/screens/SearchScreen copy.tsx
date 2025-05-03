import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SearchNavigationProp } from "../../navigation/types"; // Assuming types are in ../../navigation
import { theme } from "../../theme"; // Assuming theme is in ../../theme
// import { useAppDispatch, useAppSelector } from 'core/src/store'; // If using Redux
// import { searchVenues } from 'core/src/store/slices/venuesSlice'; // Example Redux action

// Placeholder component for SearchScreen
// Note: A SearchScreen also exists in components/common. This aligns with the import path.
export const SearchScreen = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const [query, setQuery] = useState("");
  // const dispatch = useAppDispatch(); // Uncomment if using Redux
  // const searchResults = useAppSelector((state) => state.venues.search.venues); // Example Redux state
  // const isLoading = useAppSelector((state) => state.venues.search.loading); // Example Redux state

  const handleSearch = () => {
    if (query.trim()) {
      console.log("Searching for:", query);
      // dispatch(searchVenues({ query, coordinates: /* Get coordinates */ })); // Example Redux action
      // Optionally navigate to a dedicated results screen, or display results here
      navigation.navigate("Search", {
        screen: "SearchResults", // Example nested navigation
        params: { query: query },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for restaurants, cuisines..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <Button
        title="Search"
        onPress={handleSearch}
        color={theme.lightColors?.primary}
        // disabled={isLoading} // Disable button while loading
      />
      <Text style={styles.text}>
        (Placeholder: Display search results or suggestions below)
      </Text>
      {/* Placeholder for results list */}
      {/* {isLoading && <ActivityIndicator size="large" color={theme.lightColors?.primary} />} */}
      {/* <FlatList data={searchResults} renderItem={...} keyExtractor={...} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40, // Add padding to avoid status bar overlap
    backgroundColor: theme.lightColors?.background || "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: theme.lightColors?.primary || "#000000",
  },
  input: {
    height: 45,
    borderColor: theme.lightColors?.grey4 || "#CCCCCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: theme.lightColors?.white || "#FFFFFF",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: theme.lightColors?.grey1 || "#424242",
  },
});

// Export the component
export default SearchScreen;
