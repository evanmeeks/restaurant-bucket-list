import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../navigation/types"; // Assuming types are in ../../navigation
import { theme } from "../../theme"; // Assuming theme is in ../../theme

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, "Auth">;

// Placeholder component for AuthScreen
export const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();

  const handleLogin = () => {
    // Placeholder for login logic
    console.log("Login button pressed");
    // Example navigation after successful login (replace with actual logic)
    // navigation.navigate('Main');
  };

  const handleRegister = () => {
    // Placeholder for registration logic
    console.log("Register button pressed");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Screen</Text>
      <Text style={styles.text}>
        (Placeholder: Implement Login/Registration form)
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          onPress={handleLogin}
          color={theme.lightColors?.primary}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Register"
          onPress={handleRegister}
          color={theme.lightColors?.secondary}
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: theme.lightColors?.primary || "#000000",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: theme.lightColors?.grey1 || "#424242",
  },
  buttonContainer: {
    marginVertical: 10,
    width: "80%",
  },
});

// Export the component
export default AuthScreen;
