import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "../../src/firebase/config";
import { useFavorites } from "../../src/context/FavoriteContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import ImagePreviewModal from "../../src/components/ImagePreviewModal";
import { getRecentGeneratedImages } from "../../src/utils/saveGeneratedImage";

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null); // ✅ State ekledik
  const { favorites } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserInfo(snap.data());
        }

        const localUris = await getRecentGeneratedImages(user.uid);
        localUris.reverse();
        setImages(localUris);
      } catch (err) {
        console.log("🔥 Hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleGoSettings = () => {
    router.push("/profileScreens/SettingsScreen");
  };

  if (!user || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Text style={styles.username}>
            {userInfo?.username || "Yunus Emre[MOCK]"}
          </Text>
          <Text style={styles.email}>{userInfo?.email || user.email}</Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoSettings}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userInfo?.coins || 0}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoriler</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {userInfo?.generatedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Üretimler</Text>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.imagesList}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setPreviewUri(item)}>
            <Image source={{ uri: item }} style={styles.imageItem} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* ✅ ImagePreviewModal ekledik */}
      <ImagePreviewModal
        visible={!!previewUri}
        uri={previewUri!}
        onClose={() => setPreviewUri(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#7B5EFF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7B5EFF",
  },
  headerContainer: {
    backgroundColor: "#7B5EFF",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  email: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 4,
  },
  menuButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  gridContainer: {
    backgroundColor: "#7B5EFF",
    padding: 2,
    paddingBottom: 100,
  },
  imagesList: {
    flex: 1,
  },
  imageItem: {
    width: screenWidth / 3 - 6,
    height: screenWidth / 3 - 6,
    margin: 3,
    borderRadius: 8,
  },
});
