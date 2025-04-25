import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import * as Application from "expo-application";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const isSocialLogin = user?.providerData?.[0]?.providerId !== "password";
  const version =
    Application.nativeApplicationVersion || "Sürüm bilgisi bulunamadı";

  const handleDeleteAccount = () => {
    Alert.alert("Bilgilendirme", "Veri silme özelliği henüz aktif değildir.");
  };

  const handleSupport = () => {
    Alert.alert(
      "Destek",
      "Lütfen support@example.com adresine e-posta gönderin."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Ayarlar</Text>

        {/* Hesap */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesap</Text>
          {isSocialLogin ? (
            <Text style={styles.info}>
              Bu hesap bir Google/Apple hesabı ile oluşturulduğu için parola ve
              e-posta değiştirilemez.
            </Text>
          ) : (
            <>
              <TouchableOpacity style={styles.buttonOutline}>
                <Text style={styles.buttonOutlineText}>Parola Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonOutline}>
                <Text style={styles.buttonOutlineText}>E-posta Değiştir</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Uygulama */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uygulama</Text>
          <TouchableOpacity style={styles.buttonOutline}>
            <Text style={styles.buttonOutlineText}>
              Tema (Açık/Koyu Mod) [Mock]
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gizlilik */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gizlilik</Text>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.buttonOutlineText, { color: "red" }]}>
              Verilerimi Sil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Destek */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destek</Text>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={handleSupport}
          >
            <Text style={styles.buttonOutlineText}>support@example.com</Text>
          </TouchableOpacity>
        </View>

        {/* Hakkında */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hakkında</Text>
          <Text style={styles.info}>
            Bu uygulama, kullanıcıların fotoğraflarına yaratıcı stiller ve
            efektler uygulayarak farklı sonuçlar elde etmesini sağlayan bir
            fotoğraf düzenleme aracıdır.
          </Text>
        </View>

        {/* Sürüm */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sürüm</Text>
          <Text style={styles.info}>{version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#7B5EFF",
  },
  container: {
    padding: 24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 32,
  },
  card: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#444",
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12, // React Native < 0.71 için paddingRight + marginLeft kullanabilirsin
    flexWrap: "wrap",
  },
  halfCard: {
    flex: 1,
    maxWidth: "45%",
  },
  info: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  buttonOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
