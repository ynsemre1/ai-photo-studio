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
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"
import { useTheme } from "../../../src/context/ThemeContext"
import { router } from "expo-router"
import { Feather } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeIn, SlideInUp } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

export default function ChangePasswordScreen() {
  const auth = getAuth()
  const user = auth.currentUser
  const { colors, scheme } = useTheme()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [oldPasswordError, setOldPasswordError] = useState("")
  const [newPasswordError, setNewPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  const [passwordStrength, setPasswordStrength] = useState(0)

  const validateOldPassword = (pass: string) => {
    if (!pass) {
      setOldPasswordError("Current password is required")
      return false
    }
    setOldPasswordError("")
    return true
  }

  const validateNewPassword = (pass: string) => {
    if (!pass) {
      setNewPasswordError("New password is required")
      setPasswordStrength(0)
      return false
    }

    if (pass.length < 6) {
      setNewPasswordError("Password must be at least 6 characters")
      setPasswordStrength(1)
      return false
    }

    // Calculate password strength
    let strength = 0
    if (pass.length >= 8) strength += 1
    if (/[A-Z]/.test(pass)) strength += 1
    if (/[0-9]/.test(pass)) strength += 1
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1

    setPasswordStrength(strength)

    if (strength < 2) {
      setNewPasswordError("Password is too weak")
      return false
    }

    setNewPasswordError("")
    return true
  }

  const validateConfirmPassword = (pass: string, newPass: string) => {
    if (!pass) {
      setConfirmPasswordError("Please confirm your password")
      return false
    }

    if (pass !== newPass) {
      setConfirmPasswordError("Passwords do not match")
      return false
    }

    setConfirmPasswordError("")
    return true
  }

  const handleChangePassword = async () => {
    const isOldPasswordValid = validateOldPassword(oldPassword)
    const isNewPasswordValid = validateNewPassword(newPassword)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, newPassword)

    if (!isOldPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    try {
      setLoading(true)
      const credential = EmailAuthProvider.credential(user!.email!, oldPassword)
      await reauthenticateWithCredential(user!, credential)
      await updatePassword(user!, newPassword)

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      Alert.alert("Success", "Your password has been successfully changed.", [
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
        setOldPasswordError("Incorrect password")
      } else {
        Alert.alert("Error", error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return colors.error.DEFAULT
      case 1:
        return colors.error.DEFAULT
      case 2:
        return colors.warning.DEFAULT
      case 3:
        return colors.success.DEFAULT
      case 4:
        return colors.success.DEFAULT
      default:
        return colors.error.DEFAULT
    }
  }

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return ""
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return ""
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
          <Text style={[styles.header, { color: colors.text.primary }]}>Change Password</Text>
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
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>Update Your Password</Text>
            <Text style={[styles.formSubtitle, { color: colors.text.secondary }]}>
              Enter your current password and create a new one
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Current Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: scheme === "dark" ? colors.bg.DEFAULT : colors.surface[100],
                    borderColor: oldPasswordError ? colors.error.DEFAULT : "transparent",
                    borderWidth: oldPasswordError ? 1 : 0,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={oldPasswordError ? colors.error.DEFAULT : colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Enter your current password"
                  placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={(text) => {
                    setOldPassword(text)
                    if (oldPasswordError) validateOldPassword(text)
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                    setShowOldPassword(!showOldPassword)
                  }}
                  style={styles.eyeIcon}
                >
                  <Feather name={showOldPassword ? "eye" : "eye-off"} size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              {oldPasswordError ? (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={[styles.errorText, { color: colors.error.DEFAULT }]}
                >
                  {oldPasswordError}
                </Animated.Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: scheme === "dark" ? colors.bg.DEFAULT : colors.surface[100],
                    borderColor: newPasswordError ? colors.error.DEFAULT : "transparent",
                    borderWidth: newPasswordError ? 1 : 0,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={newPasswordError ? colors.error.DEFAULT : colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Create new password"
                  placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text)
                    validateNewPassword(text)
                    if (confirmPassword) {
                      validateConfirmPassword(confirmPassword, text)
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                    setShowNewPassword(!showNewPassword)
                  }}
                  style={styles.eyeIcon}
                >
                  <Feather name={showNewPassword ? "eye" : "eye-off"} size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              {newPasswordError ? (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={[styles.errorText, { color: colors.error.DEFAULT }]}
                >
                  {newPasswordError}
                </Animated.Text>
              ) : passwordStrength > 0 ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: passwordStrength >= 1 ? getStrengthColor() : colors.surface[200],
                          width: "23%",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: passwordStrength >= 2 ? getStrengthColor() : colors.surface[200],
                          width: "23%",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: passwordStrength >= 3 ? getStrengthColor() : colors.surface[200],
                          width: "23%",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: passwordStrength >= 4 ? getStrengthColor() : colors.surface[200],
                          width: "23%",
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: getStrengthColor() }]}>{getStrengthText()}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Confirm New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: scheme === "dark" ? colors.bg.DEFAULT : colors.surface[100],
                    borderColor: confirmPasswordError ? colors.error.DEFAULT : "transparent",
                    borderWidth: confirmPasswordError ? 1 : 0,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={confirmPasswordError ? colors.error.DEFAULT : colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (confirmPasswordError) validateConfirmPassword(text, newPassword)
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                    setShowConfirmPassword(!showConfirmPassword)
                  }}
                  style={styles.eyeIcon}
                >
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={[styles.errorText, { color: colors.error.DEFAULT }]}
                >
                  {confirmPasswordError}
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
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Update Password</Text>
                  <Feather name="check" size={20} color={colors.text.inverse} />
                </>
              )}
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.noteContainer}>
              <Feather name="info" size={16} color={colors.info.DEFAULT} style={styles.noteIcon} />
              <Text style={[styles.noteText, { color: colors.text.secondary }]}>
                For a strong password, use at least 8 characters with a mix of uppercase, lowercase, numbers, and
                special characters.
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
  strengthContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  strengthBars: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
    justifyContent: "space-between",
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    width: 50,
    textAlign: "right",
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
