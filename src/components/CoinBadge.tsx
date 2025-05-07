"use client"
import { Pressable, StyleSheet, Text, View, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../context/ThemeContext"
import { useCoin } from "../context/CoinContext"
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

export default function CoinBadge() {
  const router = useRouter()
  const { colors, scheme } = useTheme()
  const { coin } = useCoin()

  const scale = useSharedValue(1)
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    
    // Animation
    scale.value = withSpring(0.9, { damping: 10 }, () => {
      scale.value = withSpring(1)
    })
    
    // Navigation
    router.push("/purchase")
  }

  return (
    <Animated.View entering={FadeIn.duration(500)} style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
            borderColor: colors.primary[300],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        onPress={handlePress}
        android_ripple={{ color: colors.primary[100], borderless: false }}
      >
        <LinearGradient
          colors={
            scheme === "dark"
              ? [colors.primary[700], colors.primary[900]]
              : [colors.primary[300], colors.primary[500]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name="cart-outline" size={16} color={colors.text.inverse} />
        </LinearGradient>
        
        <View style={styles.coinContainer}>
          <Ionicons name="wallet-outline" size={14} color={colors.primary.DEFAULT} />
          <Text style={[styles.coinText, { color: colors.text.primary }]}>{coin}</Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinText: {
    fontSize: 14,
    fontWeight: "700",
  },
})
