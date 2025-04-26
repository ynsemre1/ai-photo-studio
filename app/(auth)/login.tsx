import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Switch } from "react-native";
import { useGoogleLogin } from "../../src/firebase/auth/googleLogin";
import { loginWithApple } from "../../src/firebase/auth/appleLogin";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function LoginScreen() {
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

      setTimeout(() => {
        router.replace("/");
      }, 100);
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome Back</Text>
      </View>

      <View style={styles.formArea}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.checkboxRow}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#ccc", true: "#7B5EFF" }}
            thumbColor={rememberMe ? "#FFD700" : "#f4f3f4"}
          />
          <Text style={styles.checkboxLabel}>Beni Hatırla</Text>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Login"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity onPress={handleGoogleLogin} style={styles.socialButton}>
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAppleLogin} style={styles.socialButton}>
            <AntDesign name="apple1" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.registerText}>
            Don’t have an account? <Text style={styles.registerLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#7B5EFF" },
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  headerText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  formArea: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, flex: 1 },
  input: { backgroundColor: "#F5F5F5", padding: 14, borderRadius: 12, marginBottom: 16 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: "#333" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20 },
  forgotText: { fontSize: 13, color: "#888", textDecorationLine: "underline" },
  button: { backgroundColor: "#FFD700", paddingVertical: 14, borderRadius: 30, alignItems: "center", marginBottom: 20 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  or: { textAlign: "center", marginVertical: 8, color: "#888" },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 20 },
  socialButton: { backgroundColor: "#F5F5F5", padding: 12, borderRadius: 12 },
  registerText: { color: "#444", textAlign: "center" },
  registerLink: { fontWeight: "bold", textDecorationLine: "underline" },
});
