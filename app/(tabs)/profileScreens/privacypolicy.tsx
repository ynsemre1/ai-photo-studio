import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";

export default function PrivacyScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Gizlilik Politikası</Text>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>1. Uygulama Hakkında</Text>
        <Text style={[styles.text, { color: colors.text.primary }]}>
          Bu uygulama, kullanıcıların fotoğraflarını düzenlemesine, stil
          efektleri uygulamasına ve yaratıcı görseller oluşturmasına olanak
          sağlar. Uygulama hem Android hem iOS platformlarında çalışır.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>2. Toplanan Veriler</Text>
        <Text style={[styles.text, { color: colors.text.primary }]}>
          Uygulamada kullanıcıların e-posta adresi gibi kimlik bilgileri,
          Firebase üzerinden kimlik doğrulama sırasında toplanır. Kullanıcının
          yüklediği ve düzenlediği görseller, Firebase Storage üzerinde
          saklanmaktadır. Ayrıca gelecekte reklam gösterimleri için cihaz
          bilgileri toplanabilir.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>3. Üçüncü Taraf Servisler</Text>
        <Text style={[styles.text, { color: colors.text.primary }]}>
          Uygulama, OpenAI API'si ile görsel işleme, Google ve Apple kimlik
          sağlayıcıları ile giriş işlemleri gerçekleştirmektedir. Reklamlar için
          üçüncü taraf reklam ağları entegre edilebilir. Uygulamada henüz
          kullanılmasa da, Google Analytics veya benzeri araçlar gelecekte
          kullanılabilir.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>4. Verilerin Saklanması</Text>
        <Text style={[styles.text, { color: colors.text.primary }]}>
          Tüm kullanıcı verileri ve görseller güvenli şekilde Firebase
          altyapısında barındırılmaktadır. Uygulama silindiğinde lokal cihazda
          tutulan görseller de silinir. Firebase'deki veriler kalıcıdır.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>5. Kullanıcı Hakları</Text>
        <Text style={[styles.text, { color: colors.text.primary }]}>
          Kullanıcılar diledikleri zaman uygulamadan çıkış yapabilir. Şu an için
          verilerin silinmesi uygulama içinden mümkün değildir, ancak bu özellik
          gelecekte eklenecektir.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>6. Politika Güncellemeleri</Text>
        <Text style={[styles.text, { color: colors.text.primary }]}>
          Bu gizlilik politikası gerektiğinde manuel olarak güncellenebilir. En
          son güncellenme tarihi ekranın sonunda belirtilir.
        </Text>

        <Text style={[styles.text, { color: colors.text.primary }]}>Son Güncelleme: Nisan 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
});
