import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import * as Application from "expo-application";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ✅ Kullanıcı çıkış yaptıktan sonra doğrudan Welcome'a atla
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Hata", "Çıkış yapılamadı, lütfen tekrar deneyin.");
    }
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
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Parola Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>E-posta Değiştir</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ff5252" }]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Uygulama */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uygulama</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Tema (Açık/Koyu Mod) [Mock]</Text>
          </TouchableOpacity>
        </View>

        {/* Gizlilik */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gizlilik</Text>
          <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
            <Text style={[styles.buttonText, { color: "#b00020" }]}>
              Verilerimi Sil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/profileScreens/privacypolicy")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#333"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Gizlilik</Text>
          </TouchableOpacity>
        </View>

        {/* Destek */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destek</Text>
          <TouchableOpacity style={styles.button} onPress={handleSupport}>
            <Text style={styles.buttonText}>support@example.com</Text>
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
    backgroundColor: "#7B5EFF",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  info: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  halfCard: {
    flex: 1,
  },
});
