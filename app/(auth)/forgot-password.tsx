// app/(auth)/forgot-password.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { useTheme } from "../../src/context/ThemeContext";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const { colors } = useTheme();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Lütfen e-posta adresini gir.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Gönderildi",
        "Şifre sıfırlama bağlantısı e-postana gönderildi."
      );
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary[600] }]}>
      <Text style={[styles.title, { color: colors.text.inverse }]}>
        Reset Password
      </Text>

      <View style={[styles.form, { backgroundColor: colors.surface[100] }]}>
        <TextInput
          placeholder="Email Address"
          placeholderTextColor={colors.text.secondary}
          style={[styles.input, { color: colors.text.primary }]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
            Send Reset Link
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 32 },
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
  input: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
