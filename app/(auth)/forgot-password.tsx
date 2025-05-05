"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../src/firebase/config"
import { useTheme } from "../../src/context/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { colors, scheme } = useTheme()

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Information", "Please enter your email address.")
      return
    }

    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      Alert.alert("Email Sent", "Password reset link has been sent to your email.")
      router.back()
    } catch (error: any) {
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={scheme === "dark" ? [colors.bg.DEFAULT, colors.primary[900]] : [colors.primary[100], colors.primary[200]]}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Feather name="arrow-left" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Image source={require("../../src/assets/splash-icon.png")} style={styles.logo} resizeMode="contain" />

        <Text style={[styles.title, { color: colors.text.primary }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Enter your email address and we'll send you a link to reset your password
        </Text>

        <View style={[styles.form, { backgroundColor: scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT }]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: scheme === "dark" ? colors.bg.DEFAULT : colors.surface[100] },
              ]}
            >
              <Feather name="mail" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Sending...</Text>
            ) : (
              <>
                <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Send Reset Link</Text>
                <Feather name="send" size={20} color={colors.text.inverse} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  form: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 15,
  },
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
})
