"use client"
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native"
import { router } from "expo-router"
import { useTheme } from "../../src/context/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export default function WelcomeScreen() {
  const { colors, scheme } = useTheme()

  return (
    <LinearGradient
      colors={
        scheme === "dark"
          ? [colors.bg.DEFAULT, colors.primary[900]]
          : [colors.primary[100], colors.primary[200]]
      }
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../src/assets/splash-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>AI Photo Studio</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Transform your photos with AI-powered creative styles
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Create Account</Text>
            <Feather name="arrow-right" size={20} color={colors.text.inverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: colors.primary.DEFAULT }]}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineButtonText, { color: colors.primary.DEFAULT }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
})
