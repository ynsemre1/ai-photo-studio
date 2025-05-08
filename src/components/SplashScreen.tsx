// src/components/SplashScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/splash.json")}
        autoPlay
        loop={false}
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7B5EFF",
    alignItems: "center",
    justifyContent: "center",
  },
});