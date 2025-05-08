import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
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
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const styleData = useStyleData();
  const { colors, scheme } = useTheme();

  const [showFavorites, setShowFavorites] = useState(true);
  const [showAllStyles, setShowAllStyles] = useState(true);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [visibleStyles, setVisibleStyles] = useState(16);
  const [hasAnimated, setHasAnimated] = useState(false); // 🧠 Animasyonun sadece 1 kez çalışmasını kontrol eder

  useEffect(() => {
    setHasAnimated(true);
  }, []);

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

  const loadMoreStyles = () => {
    if (visibleStyles < allStyles.length) {
      setVisibleStyles((prev) => prev + 16);
    }
  };

  const headerComponent = useMemo(
    () => (
      <>
        <View style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            AI Photo Studio
          </Text>
          <Text
            style={[styles.welcomeSubtext, { color: colors.text.secondary }]}
          >
            Transform your photos with AI
          </Text>
        </View>

        {recentImages.length > 0 && (
          <View>
            <TouchableOpacity style={styles.sectionHeader}>
              <Text style={[styles.header, { color: colors.text.primary }]}>
                Recent Creations
              </Text>
            </TouchableOpacity>
            <View style={styles.horizontalList}>
              <FlatList
                data={recentImages}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setPreviewUri(item)}>
                    <Image
                      source={{ uri: item }}
                      style={[
                        styles.previewImage,
                        {
                          borderColor:
                            scheme === "dark"
                              ? colors.primary[800]
                              : colors.primary[200],
                          borderWidth: 2,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        )}

        <View>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowFavorites((prev) => !prev)}
          >
            <Text style={[styles.header, { color: colors.text.primary }]}>
              Favorites
            </Text>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? colors.primary[800]
                      : colors.primary[100],
                },
              ]}
            >
              <Ionicons
                name={showFavorites ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.primary.DEFAULT}
              />
            </View>
          </TouchableOpacity>

          <FlatList
            data={showFavorites ? favoriteItems : []}
            keyExtractor={(item) => item!.uri}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) =>
              item ? (
                <StyleBox
                  uri={item.uri}
                  value={item.value}
                  onPress={handlePress}
                  size={boxSize}
                />
              ) : null
            }
          />
        </View>

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowAllStyles((prev) => !prev)}
        >
          <Text style={[styles.header, { color: colors.text.primary }]}>
            All Styles
          </Text>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  scheme === "dark" ? colors.primary[800] : colors.primary[100],
              },
            ]}
          >
            <Ionicons
              name={showAllStyles ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary.DEFAULT}
            />
          </View>
        </TouchableOpacity>
      </>
    ),
    [recentImages, scheme, colors, favoriteItems, showFavorites, showAllStyles]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <LinearGradient
        colors={
          scheme === "dark"
            ? [colors.bg.DEFAULT, colors.primary[900]]
            : [colors.bg.DEFAULT, colors.primary[50]]
        }
        style={{ flex: 1 }}
      >
        <FlatList
          data={showAllStyles ? allStyles.slice(0, visibleStyles) : []}
          numColumns={2}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{ justifyContent: "center" }}
          onEndReached={loadMoreStyles}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={headerComponent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
          )}
        />
        <ImagePreviewModal
          visible={!!previewUri}
          uri={previewUri!}
          onClose={() => setPreviewUri(null)}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalList: {
    paddingLeft: 8,
    paddingBottom: 16,
    flexDirection: "row",
  },
  gridContainer: {
    paddingBottom: 100,
    paddingHorizontal: 8,
  },
  previewImage: {
    width: boxSize,
    height: boxSize,
    borderRadius: 12,
    marginRight: 8,
  },
});
