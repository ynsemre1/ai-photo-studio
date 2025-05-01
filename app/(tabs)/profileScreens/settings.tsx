import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/context/ThemeContext";
import { Linking } from "react-native";

export default function SettingsScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();
  const { colors, scheme, toggle } = useTheme();
  const isSocialLogin = user?.providerData?.[0]?.providerId !== "password";
  const version =
    Application.nativeApplicationVersion || "Sürüm bilgisi bulunamadı";

  const handleDeleteAccount = () => {
    Alert.alert("Bilgilendirme", "Veri silme özelliği henüz aktif değildir.");
  };

  const handleSupport = () => {
    Alert.alert(
      "Destek",
      "Lütfen 4.dort.studios@gmail.com adresine e-posta gönderin."
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Hata", "Çıkış yapılamadı, lütfen tekrar deneyin.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.bg.DEFAULT },
        ]}
      >
        <Text style={[styles.header, { color: colors.text.primary }]}>
          Ayarlar
        </Text>

        {/* Hesap */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.primary[100],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Hesap
          </Text>
          {isSocialLogin ? (
            <Text style={[styles.info, { color: colors.text.secondary }]}>
              Bu hesap bir Google/Apple hesabı ile oluşturulduğu için parola ve
              e-posta değiştirilemez.
            </Text>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.success.DEFAULT },
                ]}
              >
                <Text
                  style={[styles.buttonText, { color: colors.text.inverse }]}
                >
                  Parola Değiştir
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.success.DEFAULT },
                ]}
              >
                <Text
                  style={[styles.buttonText, { color: colors.text.inverse }]}
                >
                  E-posta Değiştir
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.error.DEFAULT }]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Uygulama */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.primary[100],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Uygulama
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
            onPress={toggle}
          >
            <Ionicons
              name={scheme === "dark" ? "sunny-outline" : "moon-outline"}
              size={20}
              color={colors.text.inverse}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              Tema: {scheme === "dark" ? "Koyu" : "Açık"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gizlilik */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.primary[100],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Gizlilik
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
            <Text style={[styles.buttonText, { color: colors.error.DEFAULT }]}>
              Verilerimi Sil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
            onPress={() => Linking.openURL("https://legal.4studios.com.tr/")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.text.inverse}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              Gizlilik
            </Text>
          </TouchableOpacity>
        </View>

        {/* Destek */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.primary[100],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Destek
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleSupport}>
            <Text style={[styles.buttonText, { color: colors.text.primary }]}>
              4.dort.studios@gmail.com
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hakkında */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.primary[100],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Hakkında
          </Text>
          <Text style={[styles.info, { color: colors.text.secondary }]}>
            Bu uygulama, kullanıcıların fotoğraflarına yaratıcı stiller ve
            efektler uygulayarak farklı sonuçlar elde etmesini sağlayan bir
            fotoğraf düzenleme aracıdır.
          </Text>
        </View>

        {/* Sürüm */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.primary[100],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Sürüm
          </Text>
          <Text style={[styles.info, { color: colors.text.secondary }]}>
            {version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    width: 24,
    height: 24,
  },
});
