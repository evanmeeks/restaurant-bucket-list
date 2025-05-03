import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { ProfileNavigationProp } from "../../navigation/types"; // Assuming types are in ../../navigation
import { theme } from "../../theme"; // Assuming theme is in ../../theme
// import { useAppDispatch, useAppSelector } from 'core/src/store'; // If using Redux
// import { logout } from 'core/src/store/slices/authSlice'; // Example Redux action

// Placeholder component for ProfileScreen
// Note: A ProfileScreen also exists in components/common. This aligns with the import path.
export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  // const dispatch = useAppDispatch(); // Uncomment if using Redux
  // const user = useAppSelector((state) => state.auth.user); // Example Redux state

  const handleLogout = () => {
    // Placeholder for logout logic
    console.log("Logout button pressed");
    // dispatch(logout()); // Example Redux action
    // Navigation after logout usually handled by the main navigator based on auth state
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      {/* Example user info */}
      {/* <Text style={styles.text}>Welcome, {user?.displayName || 'User'}!</Text>
      <Text style={styles.text}>Email: {user?.email}</Text> */}
      <Text style={styles.text}>
        (Placeholder: Display user info, stats, settings links)
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Settings"
          onPress={navigateToSettings}
          color={theme.lightColors?.secondary}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Log Out"
          onPress={handleLogout}
          color={theme.lightColors?.error}
        />
      </View>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.lightColors?.primary || "#000000",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: theme.lightColors?.grey1 || "#424242",
  },
  buttonContainer: {
    marginVertical: 10,
    width: "60%",
  },
});

// Export the component
export default ProfileScreen;
