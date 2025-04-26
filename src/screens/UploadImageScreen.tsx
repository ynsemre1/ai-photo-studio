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
import { Feather } from "@expo/vector-icons";

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

  const handleResetGenerated = () => {
    setGeneratedUri(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fotoğraf Yükle</Text>

      {/* 1️⃣ Orijinal Görsel */}
      <TouchableOpacity style={styles.previewBox} onPress={pickImage} activeOpacity={0.8}>
        {originalUri ? (
          <Image source={{ uri: originalUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Henüz fotoğraf seçilmedi</Text>
        )}
      </TouchableOpacity>

      {/* 2️⃣ Üretilen Görsel */}
      <TouchableOpacity
        style={styles.previewBox}
        onPress={!generatedUri && !loading ? handleUpload : undefined}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : generatedUri ? (
          <>
            <Image source={{ uri: generatedUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleResetGenerated}
              activeOpacity={0.8}
            >
              <Feather name="rotate-ccw" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholderText}>Henüz sonuç yok</Text>
        )}
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
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#ddd",
    textAlign: "center",
  },
  refreshButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#00000050",
    borderRadius: 20,
    padding: 6,
  },
});