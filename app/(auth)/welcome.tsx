import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  console.log("👋 Welcome Screen is loaded"); 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let’s Get Started!</Text>
      <Image
        // source={{ uri: 'https://i.ibb.co/0CkFhFc/welcome.png' }} // Geçici görsel, istersen kendi çizimini koyarız
        style={styles.image}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7B5EFF", // arka plan rengi
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
  },
  loginLink: {
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});
