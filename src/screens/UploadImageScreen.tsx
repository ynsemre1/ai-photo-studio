"use client";

import { useState, useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useUploadImage } from "../context/UploadImageContext";

const screenWidth = Dimensions.get("window").width;

export default function UploadImageScreen() {
  const { value } = useLocalSearchParams<{ value: string }>();
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { colors, scheme } = useTheme();
  const { setTriggerCamera } = useUploadImage();

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
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.PNG,
        }
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

  useEffect(() => {
    setTriggerCamera(() => pickFromCamera);
  }, []);
  
  const pickFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        const cropped = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1024, height: 1024 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
  
        setOriginalUri(cropped.uri);
        setGeneratedUri(null);
      }
    } catch (e) {
      console.log("CAMERA ERROR:", e);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.bg.DEFAULT },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {value ? `Style: ${value}` : "Transform Image"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Select an image and transform it with AI
        </Text>
      </View> */}

      {/* Original Image Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Original Image
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.text.secondary }]}
          >
            Tap below to select a photo
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.previewBox,
            {
              borderColor:
                scheme === "dark" ? colors.primary[700] : colors.primary[200],
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.surface[100],
            },
          ]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {originalUri ? (
            <Image source={{ uri: originalUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Feather name="image" size={48} color={colors.text.secondary} />
              <Text
                style={[
                  styles.placeholderText,
                  { color: colors.text.secondary },
                ]}
              >
                Tap to select an image
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Generated Image Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Generated Image
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.text.secondary }]}
          >
            {originalUri
              ? "Tap below to transform your image"
              : "Select an original image first"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.previewBox,
            {
              borderColor:
                scheme === "dark" ? colors.primary[700] : colors.primary[200],
              backgroundColor:
                scheme === "dark" ? colors.surface[100] : colors.surface[100],
            },
          ]}
          onPress={
            !generatedUri && !loading && originalUri ? handleUpload : undefined
          }
          activeOpacity={originalUri && !generatedUri && !loading ? 0.8 : 1}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text
                style={[styles.loadingText, { color: colors.text.secondary }]}
              >
                Transforming image...
              </Text>
            </View>
          ) : generatedUri ? (
            <>
              <Image source={{ uri: generatedUri }} style={styles.image} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.imageGradient}
              />
              <TouchableOpacity
                style={[
                  styles.refreshButton,
                  { backgroundColor: colors.primary.DEFAULT },
                ]}
                onPress={handleResetGenerated}
                activeOpacity={0.8}
              >
                <Feather
                  name="rotate-ccw"
                  size={20}
                  color={colors.text.inverse}
                />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Feather
                name={originalUri ? "image" : "eye"}
                size={48}
                color={
                  originalUri ? colors.primary.DEFAULT : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.placeholderText,
                  {
                    color: originalUri
                      ? colors.primary.DEFAULT
                      : colors.text.secondary,
                    fontWeight: originalUri ? "600" : "normal",
                  },
                ]}
              >
                {originalUri ? "Tap to generate" : "Select an image first"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {generatedUri && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary.DEFAULT },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="download" size={20} color={colors.text.inverse} />
            <Text
              style={[styles.actionButtonText, { color: colors.text.inverse }]}
            >
              Save to Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary.DEFAULT },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="share" size={20} color={colors.text.inverse} />
            <Text
              style={[styles.actionButtonText, { color: colors.text.inverse }]}
            >
              Share Image
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: 100, // Extra space for navbar
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionContainer: {
    width: "100%",
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  previewBox: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  placeholderText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  refreshButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
