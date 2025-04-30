import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams } from "expo-router";
import { editPhoto } from "../utils/editPhoto";
import { getAuth } from "firebase/auth";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

export default function UploadImageScreen() {
  const { value } = useLocalSearchParams<{ value: string }>();
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { colors, scheme } = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const croppedUri = result.assets[0].uri;

      const resized = await ImageManipulator.manipulateAsync(
        croppedUri,
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      setOriginalUri(resized.uri);
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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      {/* 1️⃣ Orijinal Görsel */}
      <TouchableOpacity
        style={[styles.previewBox, { borderColor: scheme === "dark" ? colors.text.primary : colors.text.primary }]}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {originalUri ? (
          <Image source={{ uri: originalUri }} style={styles.image} />
        ) : (
          <Text style={[styles.placeholderText, { color: scheme === "dark" ? colors.text.primary : colors.text.primary }]}>
            Henüz fotoğraf seçilmedi
          </Text>
        )}
      </TouchableOpacity>

      {/* 2️⃣ Üretilen Görsel */}
      <TouchableOpacity
        style={[styles.previewBox, { borderColor: scheme === "dark" ? colors.text.primary : colors.text.primary }]}
        onPress={!generatedUri && !loading ? handleUpload : undefined}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.success.DEFAULT} />
        ) : generatedUri ? (
          <>
            <Image source={{ uri: generatedUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleResetGenerated}
              activeOpacity={0.8}
            >
              <Feather name="rotate-ccw" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.placeholderText, { color: scheme === "dark" ? colors.text.primary : colors.text.primary }]}>
            Fotoğrafı Yollamak İçin Bas
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  previewBox: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    borderRadius: 12,
    borderWidth: 1,
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