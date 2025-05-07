"use client"

import { useEffect, useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList, 
  Image, 
  Dimensions,
  RefreshControl
} from "react-native"
import { getAuth } from "firebase/auth"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useFavorites } from "../../../src/context/FavoriteContext"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../../../src/context/ThemeContext"
import ImagePreviewModal from "../../../src/components/ImagePreviewModal"
import { getRecentGeneratedImages } from "../../../src/utils/saveGeneratedImage"
import { useCoin } from "../../../src/context/CoinContext"
import { useUser } from "../../../src/context/UserContext"
import Animated, { FadeInDown, FadeIn, SlideInRight } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"

const screenWidth = Dimensions.get("window").width

export default function ProfileScreen() {
  const auth = getAuth()
  const user = auth.currentUser
  const { colors, scheme } = useTheme()
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const { favorites } = useFavorites()
  const { coin } = useCoin()
  const { userData, loading: userLoading } = useUser()
  const router = useRouter()

  const fetchImages = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const localUris = await getRecentGeneratedImages(user.uid)
      setImages(localUris.reverse())
    } catch (err) {
      console.log("[ERROR - fetchImages]:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [user])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchImages()
  }

  const handleGoSettings = () => {
    router.push("/profileScreens/settings")
  }

  if (!user || loading || userLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg.DEFAULT }]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg.DEFAULT }]}>
      <LinearGradient
        colors={
          scheme === "dark"
            ? [colors.bg.DEFAULT, colors.primary[900]]
            : [colors.bg.DEFAULT, colors.primary[50]]
        }
        style={{ flex: 1 }}
      >
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={[styles.headerContainer]}
        >
          <View style={styles.headerTop}>
            <View style={styles.userInfoContainer}>
              <Animated.View 
                entering={SlideInRight.delay(200).duration(600)}
                style={[styles.avatarContainer, { 
                  backgroundColor: scheme === "dark" ? colors.primary[800] : colors.primary[100],
                  borderColor: colors.primary.DEFAULT,
                }]}
              >
                <Feather name="user" size={30} color={colors.primary.DEFAULT} />
              </Animated.View>
              <View style={styles.userTextContainer}>
                <Animated.Text 
                  entering={FadeInDown.delay(300).duration(600)}
                  style={[styles.username, { color: colors.text.primary }]}
                >
                  {userData?.name && userData?.surname ? `${userData.name} ${userData.surname}` : "Your Name"}
                </Animated.Text>
                <Animated.Text 
                  entering={FadeInDown.delay(400).duration(600)}
                  style={[styles.email, { color: colors.text.secondary }]}
                >
                  {userData?.email}
                </Animated.Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.settingsButton, { 
                backgroundColor: scheme === "dark" ? colors.surface[100] : colors.primary[100],
              }]} 
              onPress={handleGoSettings}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={[
              styles.statsCard,
              {
                backgroundColor: scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor: scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <View style={styles.statBox}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary.DEFAULT }]}>
                <Ionicons name="wallet-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{coin}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Coins</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary.DEFAULT }]}>
                <Ionicons name="star-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{favorites.length}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Favorites</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary.DEFAULT }]}>
                <Ionicons name="images-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{images?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Creations</Text>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.galleryHeaderContainer}
        >
          <Text style={[styles.galleryTitle, { color: colors.text.primary }]}>
            Your Gallery
          </Text>
          <Text style={[styles.gallerySubtitle, { color: colors.text.secondary }]}>
            {images.length} images created
          </Text>
        </Animated.View>

        {images.length > 0 ? (
          <FlatList
            style={styles.imagesList}
            data={images}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(300 + index * 30).duration(600)}
              >
                <TouchableOpacity 
                  onPress={() => setPreviewUri(item)}
                  style={styles.imageTouchable}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: item }} 
                    style={[styles.imageItem, {
                      borderColor: scheme === "dark" ? colors.primary[800] : colors.primary[200],
                    }]} 
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageGradient}
                  />
                  <View style={styles.imageOverlay}>
                    <Feather name="eye" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
            contentContainerStyle={[styles.gridContainer, { backgroundColor: 'transparent' }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary.DEFAULT}
                colors={[colors.primary.DEFAULT]}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="image" size={60} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No images created yet
            </Text>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.primary.DEFAULT }]}
              onPress={() => router.push("/")}
            >
              <Text style={[styles.createButtonText, { color: colors.text.inverse }]}>
                Create Your First Image
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ImagePreviewModal visible={!!previewUri} uri={previewUri!} onClose={() => setPreviewUri(null)} />
      </LinearGradient>
    </SafeAreaView>
  )
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginRight: 12,
  },
  userTextContainer: {
    justifyContent: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  galleryHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  gallerySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  gridContainer: {
    padding: 2,
    paddingBottom: 100,
  },
  imagesList: {
    flex: 1,
  },
  imageTouchable: {
    margin: 3,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imageItem: {
    width: screenWidth / 3 - 6,
    height: screenWidth / 3 - 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    marginBottom: 24,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
