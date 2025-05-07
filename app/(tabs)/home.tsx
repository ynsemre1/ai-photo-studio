import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import StyleBox, { boxSize } from "../../src/components/StyleBox";
import { useFavorites } from "../../src/context/FavoriteContext";
import { useStyleData } from "../../src/context/StyleDataProvider";
import { Ionicons } from "@expo/vector-icons";
import { getRecentGeneratedImages } from "../../src/utils/saveGeneratedImage";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import ImagePreviewModal from "../../src/components/ImagePreviewModal";
import { useTheme } from "../../src/context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const styleData = useStyleData();
  const { colors } = useTheme();

  const [showFavorites, setShowFavorites] = useState(true);
  const [showAllStyles, setShowAllStyles] = useState(true);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const uid = getAuth().currentUser?.uid || "anon";
        const images = await getRecentGeneratedImages(uid);
        images.reverse();
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
    <View style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: colors.bg.DEFAULT },
        ]}
      >
        {recentImages.length > 0 && (
          <>
            <TouchableOpacity style={styles.sectionHeader}>
              <Text style={[styles.header, { color: colors.text.primary }]}>
                Son Üretilenler
              </Text>
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

        {favoriteItems.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowFavorites((prev) => !prev)}
            >
              <Text style={[styles.header, { color: colors.text.primary }]}>
                Favoriler
              </Text>
              <Ionicons
                name={showFavorites ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            {showFavorites ? (
              <View style={styles.horizontalList}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {favoriteItems.map((item) =>
                    item ? (
                      <StyleBox
                        key={item.uri}
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
          <Text style={[styles.header, { color: colors.text.primary }]}>
            Tüm Stiller
          </Text>
          <Ionicons
            name={showAllStyles ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text.primary}
          />
        </TouchableOpacity>

        {showAllStyles ? (
          <View style={styles.gridContainer}>
            {allStyles.map((item) => (
              <StyleBox
                key={item.uri}
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

      {/* Modal en dışta */}
      <ImagePreviewModal
        visible={!!previewUri}
        uri={previewUri!}
        onClose={() => setPreviewUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 20,
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
});
