import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import {
  getAuth,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/context/ThemeContext";
import Dialog from "react-native-dialog";
import { deleteDoc, doc, collection, getDocs } from "firebase/firestore";
import { deleteObject, listAll, ref } from "firebase/storage";
import { db, storage } from "../../../src/firebase/config";

export default function SettingsScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();
  const { colors, scheme, toggle } = useTheme();
  const isSocialLogin = user?.providerData?.[0]?.providerId !== "password";
  const version =
    Application.nativeApplicationVersion || "Sürüm bilgisi bulunamadı";

  const [showDialog, setShowDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Hata", "Çıkış yapılamadı, lütfen tekrar deneyin.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Dikkat!",
      "Bu işlem hesabınızı, oluşturduğunuz tüm fotoğrafları ve kayıtlı verileri kalıcı olarak silecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Devam Et",
          style: "destructive",
          onPress: () => setShowDialog(true),
        },
      ]
    );
  };

  const handleDeleteConfirmed = async () => {
    setShowDialog(false);
    const password = passwordInput;
    setPasswordInput("");

    if (!user || !password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      const uid = user.uid;

      // Firestore: kullanıcı bilgisi sil
      await deleteDoc(doc(db, "users", uid));

      // Storage: generatedImages/{uid} sil
      const generatedRef = ref(storage, `generatedImages/${uid}`);
      const generatedFiles = await listAll(generatedRef);
      for (const item of generatedFiles.items) {
        await deleteObject(item);
      }

      // Storage: uploads/{uid} sil
      const uploadsRef = ref(storage, `uploads/${uid}`);
      const uploadFiles = await listAll(uploadsRef);
      for (const item of uploadFiles.items) {
        await deleteObject(item);
      }

      // Auth hesabı sil
      await deleteUser(user);

      Alert.alert("Silindi", "Hesabınız ve tüm verileriniz kaldırıldı.");
      router.replace("/(auth)/welcome");
    } catch (err: any) {
      Alert.alert("Hata", err.message);
    }
  };

  const handleSupport = () => {
    Alert.alert(
      "Destek",
      "Lütfen 4.dort.studios@gmail.com adresine e-posta gönderin."
    );
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
                onPress={() => router.push("/profileScreens/changePassword")}
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
                onPress={() => router.push("/profileScreens/changeEmail")}
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

      {/* Dialog */}
      <Dialog.Container visible={showDialog}>
        <Dialog.Title>Hesabını Sil</Dialog.Title>
        <Dialog.Description>
          Lütfen devam etmek için şifrenizi girin.
        </Dialog.Description>
        <Dialog.Input
          placeholder="Şifreniz"
          secureTextEntry
          value={passwordInput}
          onChangeText={setPasswordInput}
        />
        <Dialog.Button label="İptal" onPress={() => setShowDialog(false)} />
        <Dialog.Button label="Sil" onPress={handleDeleteConfirmed} />
      </Dialog.Container>
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
