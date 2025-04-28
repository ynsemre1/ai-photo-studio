import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleLogin } from "../../src/firebase/auth/googleLogin";
import { loginWithApple } from "../../src/firebase/auth/appleLogin";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";

export default function LoginScreen() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

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
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }
      router.replace("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await promptGoogleLogin();
  };

  const handleAppleLogin = async () => {
    await loginWithApple();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.primary[600] }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text.inverse }]}>Welcome Back</Text>
      </View>

      <View style={[styles.formArea, { backgroundColor: colors.surface[100] }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
          placeholder="Email Address"
          placeholderTextColor={colors.text.secondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
          placeholder="Password"
          placeholderTextColor={colors.text.secondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.checkboxRow}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: colors.surface[100], true: colors.primary.DEFAULT }}
            thumbColor={rememberMe ? colors.success.DEFAULT : "#f4f3f4"}
          />
          <Text style={[styles.checkboxLabel, { color: colors.text.primary }]}>Beni Hatırla</Text>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={[styles.forgotText, { color: colors.text.secondary }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
            {loading ? "Loading..." : "Login"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.or, { color: colors.text.secondary }]}>or</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity
            onPress={handleGoogleLogin}
            style={[styles.socialButton, { backgroundColor: colors.bg.DEFAULT }]}
          >
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAppleLogin}
            style={[styles.socialButton, { backgroundColor: colors.bg.DEFAULT }]}
          >
            <AntDesign name="apple1" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={[styles.registerText, { color: colors.text.secondary }]}>
            Don’t have an account?{" "}
            <Text style={[styles.registerLink, { color: colors.primary.DEFAULT }]}>
              Sign Up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  formArea: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  or: {
    textAlign: "center",
    marginVertical: 8,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    padding: 12,
    borderRadius: 12,
  },
  registerText: {
    textAlign: "center",
  },
  registerLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});