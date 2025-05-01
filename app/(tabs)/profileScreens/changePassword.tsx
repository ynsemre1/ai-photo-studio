import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useTheme } from "../../../src/context/ThemeContext";
import { router } from "expo-router";

export default function ChangePasswordScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { colors } = useTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Şifre Hatası", "Yeni şifreler eşleşmiyor.");
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user!.email!, oldPassword);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPassword);
      Alert.alert("Başarılı", "Şifren başarıyla değiştirildi.");
      router.back();
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary[600] }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text.inverse }]}>
            Şifre Değiştir
          </Text>
        </View>

        <View style={[styles.formArea, { backgroundColor: colors.surface[100] }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Mevcut Şifre"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Yeni Şifre"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Yeni Şifre Tekrar"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});