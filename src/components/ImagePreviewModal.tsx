import React from "react";
import {
  Modal,
  Pressable,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

interface ImagePreviewModalProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export default function ImagePreviewModal({ visible, uri, onClose }: ImagePreviewModalProps) {
  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Galeriye kaydetmek icin izin verilmeli.");
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("✅ Fotoğraf galeriye kaydedildi!");
    } catch (err) {
      console.log("🔥 Galeriye kaydetme hatası:", err);
    }
  };

  const shareImage = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("❌ Bu cihaz paylaşım desteklemiyor.");
      }
    } catch (err) {
      console.log("🔥 Paylaşım hatası:", err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Image source={{ uri }} style={styles.modalImage} resizeMode="contain" />
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={saveToGallery} style={styles.iconButton}>
            <Feather name="download" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareImage} style={[styles.iconButton, { marginLeft: 16 }]}> 
            <Feather name="share-2" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "90%",
    borderRadius: 16,
  },
  topButtons: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#00000050",
    borderRadius: 20,
    padding: 6,
  },
});
