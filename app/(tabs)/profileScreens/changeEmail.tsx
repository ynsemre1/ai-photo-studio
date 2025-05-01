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
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from "firebase/auth";
import { useTheme } from "../../../src/context/ThemeContext";
import { router } from "expo-router";

export default function ChangeEmailScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { colors } = useTheme();

  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!password || !newEmail) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user!.email!, password);
      await reauthenticateWithCredential(user!, credential);
      await updateEmail(user!, newEmail);
      Alert.alert("Başarılı", "E-posta adresin güncellendi.");
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
            E-posta Değiştir
          </Text>
        </View>

        <View style={[styles.formArea, { backgroundColor: colors.surface[100] }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Mevcut Parola"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Yeni E-posta"
            placeholderTextColor={colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={newEmail}
            onChangeText={setNewEmail}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
            onPress={handleChangeEmail}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {loading ? "Güncelleniyor..." : "E-postayı Güncelle"}
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