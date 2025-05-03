import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { theme } from "../../theme"; // Assuming theme is in ../../theme
// import { useAppDispatch, useAppSelector } from 'core/src/store'; // If using Redux
// import { toggleTheme, setPreference } from 'core/src/store/slices/uiSlice'; // Example Redux actions

// Placeholder component for SettingsScreen
export const SettingsScreen = () => {
  // const dispatch = useAppDispatch(); // Uncomment if using Redux
  // const currentTheme = useAppSelector((state) => state.ui.theme); // Example Redux state
  // const isDark = currentTheme === 'dark';

  const handleThemeToggle = (value: boolean) => {
    console.log("Theme toggle:", value ? "dark" : "light");
    // dispatch(toggleTheme()); // Example Redux action
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          // value={isDark} // Use Redux state if available
          // onValueChange={handleThemeToggle}
          trackColor={{
            false: theme.lightColors?.grey4,
            true: theme.lightColors?.primary,
          }}
          thumbColor={theme.lightColors?.white}
        />
      </View>

      <Text style={styles.placeholder}>
        (Placeholder: Add more settings like notifications, preferences, etc.)
      </Text>
      {/* Add more settings options here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.lightColors?.background || "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: theme.lightColors?.grey0 || "#000000",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightColors?.divider || "#EEEEEE",
  },
  settingText: {
    fontSize: 18,
    color: theme.lightColors?.grey1 || "#424242",
  },
  placeholder: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    color: theme.lightColors?.grey3 || "#757575",
  },
});

// Export the component
export default SettingsScreen;
