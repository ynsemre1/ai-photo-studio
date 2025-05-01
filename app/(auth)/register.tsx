import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { router } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { getErrorMessage } from "../../src/utils/getErrorMessage";

export default function RegisterScreen() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Lütfen e-posta ve şifreyi girin.");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error: any) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary[600] }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text.inverse }]}>
            Create Account
          </Text>
        </View>

        <View
          style={[styles.formArea, { backgroundColor: colors.surface[100] }]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.bg.DEFAULT,
                color: colors.text.primary,
              },
            ]}
            placeholder="Email Address"
            placeholderTextColor={colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.bg.DEFAULT,
                color: colors.text.primary,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {loading ? "Creating..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.or, { color: colors.text.secondary }]}>or</Text>

          <View style={styles.socialRow}>
            {/* Sosyal giriş butonları buraya eklenebilir */}
          </View>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={[styles.loginText, { color: colors.text.secondary }]}>
              Already have an account?{" "}
              <Text
                style={[styles.loginLink, { color: colors.primary.DEFAULT }]}
              >
                Login
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  loginText: {
    textAlign: "center",
  },
  loginLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});