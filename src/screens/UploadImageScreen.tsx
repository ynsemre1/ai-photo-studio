import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { editPhoto } from "../utils/editPhoto";
import { getAuth } from "firebase/auth";

export default function UploadImageScreen() {
  //TODO: Add a paint library for draw or edit the image
  //TODO: UI improvements
  const { value } = useLocalSearchParams<{ value: string }>();
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setOriginalUri(result.assets[0].uri);
      setGeneratedUri(null);
    }
  };

  const handleUpload = async () => {
    if (!originalUri || !value) return;
    setLoading(true);

    try {
      const blob = await fetch(originalUri).then((r) => r.blob());
      const uid = getAuth().currentUser?.uid || "anon";

      const resultUrl = await editPhoto(blob, value, uid);
      setGeneratedUri(resultUrl);
    } catch (err) {
      console.log("🔥 Üretim hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fotoğraf Yükle</Text>
      <Text style={styles.testText}>Prompt: {value}</Text>

      {/* 1️⃣ Orijinal Görsel */}
      <View style={styles.previewBox}>
        {originalUri ? (
          <Image source={{ uri: originalUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Henüz fotoğraf seçilmedi</Text>
        )}
      </View>

      {/* 2️⃣ Üretilen Görsel */}
      <View style={styles.previewBox}>
        {loading ? (
          <ActivityIndicator size="large" color="#999" />
        ) : generatedUri ? (
          <Image source={{ uri: generatedUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Henüz sonuç yok</Text>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <Button title="Fotoğraf Seç" onPress={pickImage} />
        <Button title="Fotoğrafı Yükle" onPress={handleUpload} disabled={!originalUri} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  testText: { fontSize: 16, marginBottom: 10, color: "#888" },
  previewBox: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#888",
  },
  buttonGroup: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
});
