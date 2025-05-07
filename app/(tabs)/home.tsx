"use client"

import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import StyleBox, { boxSize } from "../../src/components/StyleBox"
import { useFavorites } from "../../src/context/FavoriteContext"
import { useStyleData } from "../../src/context/StyleDataProvider"
import { Ionicons } from "@expo/vector-icons"
import { getRecentGeneratedImages } from "../../src/utils/saveGeneratedImage"
import { useFocusEffect } from "@react-navigation/native"
import { getAuth } from "firebase/auth"
import ImagePreviewModal from "../../src/components/ImagePreviewModal"
import { useTheme } from "../../src/context/ThemeContext"
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const router = useRouter()
  const { favorites } = useFavorites()
  const styleData = useStyleData()
  const { colors, scheme } = useTheme()

  const [showFavorites, setShowFavorites] = useState(true)
  const [showAllStyles, setShowAllStyles] = useState(true)
  const [recentImages, setRecentImages] = useState<string[]>([])
  const [previewUri, setPreviewUri] = useState<string | null>(null)

  useFocusEffect(
    React.useCallback(() => {
      ;(async () => {
        const uid = getAuth().currentUser?.uid || "anon"
        const images = await getRecentGeneratedImages(uid)
        images.reverse()
        setRecentImages(images)
      })()
    }, []),
  )

  if (!styleData) return null

  const allStyles = [...styleData.style, ...styleData.car, ...styleData.professional]

  const favoriteItems = favorites
    .map((value) => allStyles.find((item) => item.value === value))
    .filter(Boolean)
    .slice(-5)
    .reverse()

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } })
  }

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
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            AI Photo Studio
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.text.secondary }]}>
            Transform your photos with AI
          </Text>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {recentImages.length > 0 && (
            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
              <TouchableOpacity style={styles.sectionHeader}>
                <Text style={[styles.header, { color: colors.text.primary }]}>Recent Creations</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                {recentImages.map((uri, index) => (
                  <Animated.View 
                    key={uri} 
                    entering={FadeInDown.delay(150 + index * 50).duration(600)}
                  >
                    <TouchableOpacity onPress={() => setPreviewUri(uri)}>
                      <Image 
                        source={{ uri }} 
                        style={[styles.previewImage, { 
                          borderColor: scheme === "dark" ? colors.primary[800] : colors.primary[200],
                          borderWidth: 2,
                        }]} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {favoriteItems.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => setShowFavorites((prev) => !prev)}
              >
                <Text style={[styles.header, { color: colors.text.primary }]}>Favorites</Text>
                <View style={[styles.iconContainer, { 
                  backgroundColor: scheme === "dark" ? colors.primary[800] : colors.primary[100] 
                }]}>
                  <Ionicons 
                    name={showFavorites ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.primary.DEFAULT} 
                  />
                </View>
              </TouchableOpacity>

              {showFavorites ? (
                <View style={styles.horizontalList}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {favoriteItems.map((item, index) =>
                      item ? (
                        <Animated.View 
                          key={item.uri} 
                          entering={FadeInDown.delay(250 + index * 50).duration(600)}
                        >
                          <StyleBox 
                            uri={item.uri} 
                            value={item.value} 
                            onPress={handlePress} 
                            size={boxSize} 
                          />
                        </Animated.View>
                      ) : null,
                    )}
                  </ScrollView>
                </View>
              ) : (
                <View style={{ height: 16 }} />
              )}
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => setShowAllStyles((prev) => !prev)}
            >
              <Text style={[styles.header, { color: colors.text.primary }]}>All Styles</Text>
              <View style={[styles.iconContainer, { 
                backgroundColor: scheme === "dark" ? colors.primary[800] : colors.primary[100] 
              }]}>
                <Ionicons 
                  name={showAllStyles ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.primary.DEFAULT} 
                />
              </View>
            </TouchableOpacity>

            {showAllStyles ? (
              <View style={styles.gridContainer}>
                {allStyles.map((item, index) => (
                  <Animated.View 
                    key={item.uri} 
                    entering={FadeInDown.delay(350 + index * 20).duration(600)}
                  >
                    <StyleBox 
                      uri={item.uri} 
                      value={item.value} 
                      onPress={handlePress} 
                    />
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={{ height: 16 }} />
            )}
          </Animated.View>
        </ScrollView>

        {/* Modal en dışta */}
        <ImagePreviewModal visible={!!previewUri} uri={previewUri!} onClose={() => setPreviewUri(null)} />
      </LinearGradient>
    </View>
  )
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
  scrollContainer: {
    paddingBottom: 100,
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
})
