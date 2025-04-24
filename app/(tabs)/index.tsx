import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import StyleBox, { boxSize } from "../../src/components/StyleBox";
import { useFavorites } from "../../src/context/FavoriteContext";
import { useStyleData } from "../../src/context/StyleDataProvider";
import { Ionicons } from "@expo/vector-icons";
import { getRecentGeneratedImages } from "../../src/utils/saveGeneratedImage";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

export default function HomeScreen() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const styleData = useStyleData();

  const [showFavorites, setShowFavorites] = useState(true);
  const [showAllStyles, setShowAllStyles] = useState(true);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const uid = getAuth().currentUser?.uid || "anon";
        const images = await getRecentGeneratedImages(uid);
        setRecentImages(images);
      })();
    }, [])
  );

  if (!styleData) return null;

  const allStyles = [
    ...styleData.style,
    ...styleData.car,
    ...styleData.professional,
  ];

  const favoriteItems = favorites
    .map((value) => allStyles.find((item) => item.value === value))
    .filter(Boolean)
    .slice(-5)
    .reverse();

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {recentImages.length > 0 && (
        <>
          <TouchableOpacity style={styles.sectionHeader}>
            <Text style={styles.header}>Son Üretilenler</Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          >
            {recentImages.map((uri) => (
              <TouchableOpacity key={uri} onPress={() => setPreviewUri(uri)}>
                <Image source={{ uri }} style={styles.previewImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Modal visible={!!previewUri} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPreviewUri(null)}
        >
          <Image
            source={{ uri: previewUri! }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      {favoriteItems.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowFavorites((prev) => !prev)}
          >
            <Text style={styles.header}>Favoriler</Text>
            <Ionicons
              name={showFavorites ? "chevron-up" : "chevron-down"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>

          {showFavorites ? (
            <View style={styles.horizontalList}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {favoriteItems.map((item) =>
                  item ? (
                    <StyleBox
                      key={item.value}
                      uri={item.uri}
                      value={item.value}
                      onPress={handlePress}
                      size={boxSize}
                    />
                  ) : null
                )}
              </ScrollView>
            </View>
          ) : (
            <View style={{ height: 16 }} />
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowAllStyles((prev) => !prev)}
      >
        <Text style={styles.header}>Tüm Stiller</Text>
        <Ionicons
          name={showAllStyles ? "chevron-up" : "chevron-down"}
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {showAllStyles ? (
        <View style={styles.gridContainer}>
          {allStyles.map((item) => (
            <StyleBox
              key={item.value}
              uri={item.uri}
              value={item.value}
              onPress={handlePress}
            />
          ))}
        </View>
      ) : (
        <View style={{ height: 16 }} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 20,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  horizontalList: {
    paddingLeft: 8,
    paddingBottom: 16,
    flexDirection: "row",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  previewImage: {
    width: boxSize,
    height: boxSize,
    borderRadius: 12,
    marginRight: 8,
  },
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
});
