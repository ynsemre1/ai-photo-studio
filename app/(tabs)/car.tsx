"use client"
import { View, FlatList, StyleSheet, Text } from "react-native"
import { useRouter } from "expo-router"
import { useStyleData } from "../../src/context/StyleDataProvider"
import StyleBox from "../../src/components/StyleBox"
import { useTheme } from "../../src/context/ThemeContext"
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"

export default function CarScreen() {
  const router = useRouter()
  const styleData = useStyleData()
  const { colors, scheme } = useTheme()
  const carList = styleData?.car || []

  const [visibleCount, setVisibleCount] = useState(16)

  const loadMore = () => {
    if (visibleCount < carList.length) {
      setVisibleCount(prev => prev + 16)
    }
  }

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      <LinearGradient
        colors={
          scheme === "dark"
            ? [colors.bg.DEFAULT, colors.primary[900]]
            : [colors.bg.DEFAULT, colors.primary[50]]
        }
        style={{ flex: 1 }}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerContainer}>
          <Text style={[styles.headerText, { color: colors.text.primary }]}>
            Car Styles
          </Text>
          <Text style={[styles.headerSubtext, { color: colors.text.secondary }]}>
            Transform your car photos with AI
          </Text>
        </Animated.View>

        {carList.length > 0 ? (
          <FlatList
            data={carList.slice(0, visibleCount)}
            renderItem={({ item, index }) =>
              item && item.uri && item.value ? (
                <Animated.View
                  entering={FadeInDown.delay(100 + index * 50).duration(600)}
                >
                  <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
                </Animated.View>
              ) : null
            }
            keyExtractor={(item, index) => `car-${index}`}
            numColumns={2}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="image" size={60} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No car styles available
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtext: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  gridContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
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
  },
})