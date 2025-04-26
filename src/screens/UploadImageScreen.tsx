import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { editPhoto } from "../utils/editPhoto";
import { getAuth } from "firebase/auth";

export default function UploadImageScreen() {
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

      {/* Orijinal Görsel */}
      <TouchableOpacity style={styles.previewBox} onPress={pickImage} activeOpacity={0.8}>
        {originalUri ? (
          <Image source={{ uri: originalUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Henüz fotoğraf seçilmedi</Text>
        )}
      </TouchableOpacity>

      {/* Üretilen Görsel */}
      <View style={styles.previewBox}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : generatedUri ? (
          <Image source={{ uri: generatedUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Henüz sonuç yok</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, !originalUri && styles.disabledButton]}
        onPress={handleUpload}
        disabled={!originalUri}
        activeOpacity={0.7}
      >
        <Text style={styles.uploadButtonText}>Fotoğrafı Yükle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#7B5EFF",
    flexGrow: 1,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#fff" },
  testText: { fontSize: 16, marginBottom: 10, color: "#ddd" },
  previewBox: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
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
    color: "#ddd",
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});