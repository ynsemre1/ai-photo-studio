"use client"
import { View, Pressable, Text, StyleSheet, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  interpolateColor
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

type Gender = "male" | "female"

type Props = {
  selected: Gender
  onChange: (gender: Gender) => void
}

export default function GenderSwitch({ selected, onChange }: Props) {
  const { colors, scheme } = useTheme()
  
  // Animation values
  const maleOpacity = useSharedValue(selected === "male" ? 1 : 0)
  const femaleOpacity = useSharedValue(selected === "female" ? 1 : 0)
  const maleScale = useSharedValue(selected === "male" ? 1 : 0.9)
  const femaleScale = useSharedValue(selected === "female" ? 1 : 0.9)

  const maleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: maleOpacity.value,
      transform: [{ scale: maleScale.value }]
    }
  })

  const femaleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: femaleOpacity.value,
      transform: [{ scale: femaleScale.value }]
    }
  })

  const handleSelectMale = () => {
    if (selected === "male") return
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    
    maleOpacity.value = withTiming(1, { duration: 200 })
    femaleOpacity.value = withTiming(0, { duration: 200 })
    maleScale.value = withTiming(1, { duration: 300 })
    femaleScale.value = withTiming(0.9, { duration: 300 })
    
    onChange("male")
  }

  const handleSelectFemale = () => {
    if (selected === "female") return
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    
    femaleOpacity.value = withTiming(1, { duration: 200 })
    maleOpacity.value = withTiming(0, { duration: 200 })
    femaleScale.value = withTiming(1, { duration: 300 })
    maleScale.value = withTiming(0.9, { duration: 300 })
    
    onChange("female")
  }

  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <View
        style={[
          styles.switchContainer,
          {
            backgroundColor: scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
            borderColor: colors.primary[300],
          },
        ]}
      >
        <Pressable
          onPress={handleSelectMale}
          style={[
            styles.switchItem,
            selected === "male" && {
              backgroundColor: colors.primary.DEFAULT,
            },
          ]}
          android_ripple={{ color: colors.primary[100], borderless: false }}
        >
          <Ionicons
            name="male"
            size={18}
            color={selected === "male" ? colors.text.inverse : colors.text.primary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.switchText,
              { color: selected === "male" ? colors.text.inverse : colors.text.primary },
              selected === "male" && styles.activeText,
            ]}
          >
            Male
          </Text>
          
          {selected === "male" && (
            <Animated.View style={[styles.activeIndicator, maleAnimatedStyle]}>
              <LinearGradient
                colors={
                  scheme === "dark"
                    ? [colors.primary[400], colors.primary[600]]
                    : [colors.primary[300], colors.primary[500]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientIndicator}
              />
            </Animated.View>
          )}
        </Pressable>

        <Pressable
          onPress={handleSelectFemale}
          style={[
            styles.switchItem,
            selected === "female" && {
              backgroundColor: colors.primary.DEFAULT,
            },
          ]}
          android_ripple={{ color: colors.primary[100], borderless: false }}
        >
          <Ionicons
            name="female"
            size={18}
            color={selected === "female" ? colors.text.inverse : colors.text.primary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.switchText,
              { color: selected === "female" ? colors.text.inverse : colors.text.primary },
              selected === "female" && styles.activeText,
            ]}
          >
            Female
          </Text>
          
          {selected === "female" && (
            <Animated.View style={[styles.activeIndicator, femaleAnimatedStyle]}>
              <LinearGradient
                colors={
                  scheme === "dark"
                    ? [colors.primary[400], colors.primary[600]]
                    : [colors.primary[300], colors.primary[500]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientIndicator}
              />
            </Animated.View>
          )}
        </Pressable>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  switchItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  switchText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeText: {
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientIndicator: {
    width: "100%",
    height: "100%",
  }
})
