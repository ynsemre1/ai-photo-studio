import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleLogin } from "../../src/firebase/auth/googleLogin";
import { loginWithApple } from "../../src/firebase/auth/appleLogin";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { getErrorMessage } from "../../src/utils/getErrorMessage";
import { syncGeneratedImagesFromStorage } from "../../src/utils/saveGeneratedImage";

export default function LoginScreen() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const { promptAsync: promptGoogleLogin } = useGoogleLogin();

  useEffect(() => {
    const loadRememberedData = async () => {
      const savedEmail = await AsyncStorage.getItem("email");
      const savedPassword = await AsyncStorage.getItem("password");

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadRememberedData();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Information", "Please enter your email address");
      return;
    }

    if (!password) {
      Alert.alert("Missing Information", "Please enter your password");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);

      const currentUser = auth.currentUser;

      if (currentUser && !currentUser.emailVerified) {
        const userToVerify = auth.currentUser;
        await signOut(auth);

        Alert.alert(
          "Email Verification Required",
          "You need to verify your email address before logging in.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  if (userToVerify) {
                    await sendEmailVerification(userToVerify);
                    Alert.alert(
                      "Sent",
                      "Verification email has been sent again."
                    );
                  } else {
                    Alert.alert("Error", "User information not found.");
                  }
                } catch (err) {
                  Alert.alert("Error", "Could not send email.");
                  console.error(err);
                }
              },
            },
          ],
          { cancelable: true }
        );

        return;
      }

      if (rememberMe) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }

      if (currentUser?.uid) {
        await syncGeneratedImagesFromStorage(currentUser.uid);
      }

      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await promptGoogleLogin();
    } catch (error) {
      Alert.alert("Google Login Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await loginWithApple();
    } catch (error) {
      Alert.alert("Apple Login Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, backgroundColor: colors.primary[600] }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.text.inverse }]}>
              Welcome Back
            </Text>
            <Text
              style={[styles.headerSubtext, { color: colors.text.inverse }]}
            >
              Sign in to continue
            </Text>
          </View>

          <View
            style={[styles.formArea, { backgroundColor: colors.surface[100] }]}
          >
            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: colors.text.secondary }]}
              >
                Email Address
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.bg.DEFAULT },
                ]}
              >
                <AntDesign
                  name="mail"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.inputIcon}
                />
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

            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: colors.text.secondary }]}
              >
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.bg.DEFAULT },
                ]}
              >
                <AntDesign
                  name="lock"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                />
                <TouchableOpacity
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  style={styles.eyeIcon}
                >
                  <AntDesign
                    name={secureTextEntry ? "eyeo" : "eye"}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <View style={styles.checkboxRow}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{
                    false: colors.surface[100],
                    true: colors.primary.DEFAULT,
                  }}
                  thumbColor={rememberMe ? colors.success.DEFAULT : "#f4f3f4"}
                />
                <Text
                  style={[styles.checkboxLabel, { color: colors.text.primary }]}
                >
                  Remember Me
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text
                  style={[styles.forgotText, { color: colors.primary.DEFAULT }]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.success.DEFAULT },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text
                  style={[styles.buttonText, { color: colors.text.inverse }]}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.text.secondary },
                ]}
              />
              <Text
                style={[styles.dividerText, { color: colors.text.secondary }]}
              >
                or continue with
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.text.secondary },
                ]}
              />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={[
                  styles.socialButton,
                  { backgroundColor: colors.bg.DEFAULT },
                ]}
              >
                <FontAwesome name="google" size={20} color="#DB4437" />
                <Text
                  style={[
                    styles.socialButtonText,
                    { color: colors.text.primary },
                  ]}
                >
                  Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAppleLogin}
                style={[
                  styles.socialButton,
                  { backgroundColor: colors.bg.DEFAULT },
                ]}
              >
                <AntDesign
                  name="apple1"
                  size={20}
                  color={colors.text.primary}
                />
                <Text
                  style={[
                    styles.socialButtonText,
                    { color: colors.text.primary },
                  ]}
                >
                  Apple
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text
                style={[styles.registerText, { color: colors.text.secondary }]}
              >
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text
                  style={[
                    styles.registerLink,
                    { color: colors.primary.DEFAULT },
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtext: {
    fontSize: 16,
    opacity: 0.8,
  },
  formArea: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
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
    padding: 14,
    fontSize: 15,
  },
  eyeIcon: {
    paddingHorizontal: 14,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPassword: {},
  forgotText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialButtonText: {
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
