import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Let’s Get Started!
      </Text>

      <Image
        //TODO: welcome image
        // source={{ uri: 'https://i.ibb.co/0CkFhFc/welcome.png' }}
        style={styles.image}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary.DEFAULT }]}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
          Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={[styles.loginText, { color: colors.text.secondary }]}>
          Already have an account?{" "}
          <Text style={[styles.loginLink, { color: colors.primary.DEFAULT }]}>
            Login
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    fontSize: 14,
    textAlign: "center",
  },
  loginLink: {
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});