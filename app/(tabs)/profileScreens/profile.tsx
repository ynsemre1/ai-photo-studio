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
import { db } from "../../../src/firebase/config";
import { useFavorites } from "../../../src/context/FavoriteContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";
import ImagePreviewModal from "../../../src/components/ImagePreviewModal";
import { getRecentGeneratedImages } from "../../../src/utils/saveGeneratedImage";

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { colors, scheme } = useTheme();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
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
    router.push("/profileScreens/settings");
  };

  if (!user || loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg.DEFAULT }]}>
        <ActivityIndicator size="large" color={colors.text.inverse} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg.DEFAULT }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.bg.DEFAULT }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.username, { color: colors.text.primary }]}>
            {userInfo?.username || "Yunus Emre[MOCK]"}
          </Text>
          <Text style={[styles.email, { color: colors.text.secondary }]}>
            {userInfo?.email || user.email}
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoSettings}
          >
            <Ionicons name="menu" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsCard, { backgroundColor: scheme === "dark" ? colors.surface[100] : colors.primary[100] }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {userInfo?.coins || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Coins
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {favorites.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Favoriler
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {userInfo?.generatedCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Üretimler
            </Text>
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
        contentContainerStyle={[styles.gridContainer, { backgroundColor: colors.bg.DEFAULT }]}
        showsVerticalScrollIndicator={false}
      />

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
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
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
  },
  email: {
    fontSize: 14,
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
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  gridContainer: {
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