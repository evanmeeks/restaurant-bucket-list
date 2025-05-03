import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../navigation/types"; // Assuming types are in ../../navigation
import { theme } from "../../theme"; // Assuming theme is in ../../theme
// import { useAppDispatch } from 'core/src/store'; // If using Redux for state management
// import { completeOnboarding } from 'core/src/store/slices/uiSlice'; // Action to mark onboarding complete

type OnBoardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OnBoarding"
>;

// Placeholder component for OnBoardingScreen
export const OnBoardingScreen = () => {
  const navigation = useNavigation<OnBoardingScreenNavigationProp>();
  // const dispatch = useAppDispatch(); // Uncomment if using Redux

  const handleCompleteOnboarding = () => {
    // Placeholder for completing onboarding logic
    console.log("Onboarding completed");
    // Mark onboarding as complete in state management (e.g., Redux)
    // dispatch(completeOnboarding());
    // Navigate to the main app or auth screen
    // This navigation depends on whether the user needs to authenticate next
    navigation.replace("Auth"); // Or 'Main' if authentication isn't required immediately after onboarding
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Onboarding!</Text>
      <Text style={styles.text}>
        (Placeholder: Implement onboarding steps/slides)
      </Text>
      <Button
        title="Get Started"
        onPress={handleCompleteOnboarding}
        color={theme.lightColors?.primary}
      />
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
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    color: theme.lightColors?.grey1 || "#424242",
  },
});

// Export the component
export default OnBoardingScreen;
