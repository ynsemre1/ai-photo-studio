import React from "react"
import { View, Pressable, StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

type Gender = "male" | "female"

type Props = {
  selected: Gender
  onChange: (gender: Gender) => void
}

export default function GenderSwitch({ selected, onChange }: Props) {
  const translateX = useSharedValue(selected === "female" ? 44 : 0)

  React.useEffect(() => {
    translateX.value = withTiming(selected === "female" ? 44 : 0, { duration: 250 })
  }, [selected])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View style={styles.container}>
      <View style={styles.switchWrapper}>
        {/* Background moving circle */}
        <Animated.View style={[styles.slider, animatedStyle]} />

        {/* Male */}
        <Pressable
          style={styles.switchItem}
          onPress={() => onChange("male")}
        >
          <Ionicons
            name="male"
            size={20}
            color={selected === "male" ? "#fff" : "#AAB"}
          />
        </Pressable>

        {/* Female */}
        <Pressable
          style={styles.switchItem}
          onPress={() => onChange("female")}
        >
          <Ionicons
            name="female"
            size={20}
            color={selected === "female" ? "#fff" : "#AAB"}
          />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  switchWrapper: {
    width: 88,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3F51B5",
    backgroundColor: "#0B1021",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    padding: 2,
  },
  switchItem: {
    width: 40,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  slider: {
    position: "absolute",
    width: 40,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#4A90E2",
    top: 2,
    left: 2,
    zIndex: 1,
  },
})