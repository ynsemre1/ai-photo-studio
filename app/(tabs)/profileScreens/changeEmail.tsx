"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from "firebase/auth"
import { useTheme } from "../../../src/context/ThemeContext"
import { router } from "expo-router"
import { Feather } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeIn, SlideInUp } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

export default function ChangeEmailScreen() {
  const auth = getAuth()
  const user = auth.currentUser
  const { colors, scheme } = useTheme()

  const [password, setPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (pass: string) => {
    if (!pass) {
      setPasswordError("Password is required")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleChangeEmail = async () => {
    const isEmailValid = validateEmail(newEmail)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    try {
      setLoading(true)
      const credential = EmailAuthProvider.credential(user!.email!, password)
      await reauthenticateWithCredential(user!, credential)
      await updateEmail(user!, newEmail)

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      Alert.alert("Success", "Your email has been updated.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error: any) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }

      if (error.code === "auth/wrong-password") {
        setPasswordError("Incorrect password")
      } else if (error.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use")
      } else {
        Alert.alert("Error", error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <LinearGradient
        colors={scheme === "dark" ? [colors.bg.DEFAULT, colors.primary[900]] : [colors.bg.DEFAULT, colors.primary[50]]}
        style={{ flex: 1 }}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerContainer}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: scheme === "dark" ? colors.surface[100] : colors.primary[100] },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }
              router.back()
            }}
          >
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text.primary }]}>Change Email</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Animated.View
            entering={SlideInUp.delay(100).duration(600)}
            style={[
              styles.formCard,
              {
                backgroundColor: scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor: scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>Update Your Email</Text>
            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
              Enter your current password and new email address
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Current Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: scheme === "dark" ? colors.bg.DEFAULT : colors.surface[100],
                    borderColor: passwordError ? colors.error.DEFAULT : "transparent",
                    borderWidth: passwordError ? 1 : 0,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={passwordError ? colors.error.DEFAULT : colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Enter your current password"
                  placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (passwordError) validatePassword(text)
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                    setShowPassword(!showPassword)
                  }}
                  style={styles.eyeIcon}
                >
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={[styles.errorText, { color: colors.error.DEFAULT }]}
                >
                  {passwordError}
                </Animated.Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>New Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: scheme === "dark" ? colors.bg.DEFAULT : colors.surface[100],
                    borderColor: emailError ? colors.error.DEFAULT : "transparent",
                    borderWidth: emailError ? 1 : 0,
                  },
                ]}
              >
                <Feather
                  name="mail"
                  size={20}
                  color={emailError ? colors.error.DEFAULT : colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Enter your new email"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text)
                    if (emailError) validateEmail(text)
                  }}
                />
              </View>
              {emailError ? (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={[styles.errorText, { color: colors.error.DEFAULT }]}
                >
                  {emailError}
                </Animated.Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: loading ? colors.primary[400] : colors.primary.DEFAULT,
                  opacity: loading ? 0.8 : 1,
                },
              ]}
              onPress={handleChangeEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Update Email</Text>
                  <Feather name="check" size={20} color={colors.text.inverse} />
                </>
              )}
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.noteContainer}>
              <Feather name="info" size={16} color={colors.info.DEFAULT} style={styles.noteIcon} />
              <Text style={[styles.noteText, { color: colors.text.secondary }]}>
                After changing your email, you'll need to verify the new address before you can use it to log in.
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 24,
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
    borderRadius: 12,
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
  eyeIcon: {
    paddingHorizontal: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    alignItems: "flex-start",
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
})
