import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db, dbUsers } from "../../src/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { router } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { getErrorMessage } from "../../src/utils/getErrorMessage";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RegisterScreen() {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleRegister = async () => {
    if (!name || !surname || !email || !password || !confirmPassword || !birthdate) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Şifre Hatası", "Şifreler eşleşmiyor.");
      return;
    }

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(dbUsers, "users", uid), {
        name,
        surname,
        birthdate: birthdate.toISOString(),
        email,
      });

      await sendEmailVerification(userCred.user);
      await signOut(auth);

      Alert.alert(
        "E-posta Doğrulama",
        "Kayıt başarılı. Giriş yapmadan önce e-postanı doğrulaman gerekiyor. Gelen kutunu kontrol et."
      );
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Hata", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary[600] }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text.inverse }]}>
            Kayıt Ol
          </Text>
        </View>

        <View style={[styles.formArea, { backgroundColor: colors.surface[100] }]}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
              placeholder="İsim"
              placeholderTextColor={colors.text.secondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
              placeholder="Soy İsim"
              placeholderTextColor={colors.text.secondary}
              value={surname}
              onChangeText={setSurname}
            />
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Email"
            placeholderTextColor={colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Şifre"
            placeholderTextColor={colors.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, color: colors.text.primary }]}
            placeholder="Şifre Tekrar"
            placeholderTextColor={colors.text.secondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.input, { backgroundColor: colors.bg.DEFAULT, justifyContent: "center" }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: birthdate ? colors.text.primary : colors.text.secondary }}>
              {birthdate
                ? birthdate.toLocaleDateString("tr-TR")
                : "Doğum Tarihi Seç"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              value={birthdate || new Date(2000, 0, 1)}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {loading ? "Oluşturuluyor..." : "Kayıt Ol"}
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