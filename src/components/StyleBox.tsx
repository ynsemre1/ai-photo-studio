"use client";

import { useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Animated as RNAnimated,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoriteContext";
import { useTheme } from "../context/ThemeContext";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import LoadingAnimation from "./LoadingAnimation";

const screenWidth = Dimensions.get("window").width;
export const boxSize = (screenWidth - 48) / 2;

type Props = {
  uri: string;
  value: string;
  onPress: (value: string) => void;
  size?: number;
};

export default function StyleBox({ uri, value, onPress, size }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors, scheme } = useTheme();

  const isFav = isFavorite(value);
  const scale = useSharedValue(1);
  const starScale = useSharedValue(1);
  const starRotation = useSharedValue(0);

  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const finalSize = size ?? boxSize;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: starScale.value },
      { rotate: `${starRotation.value}deg` },
    ],
  }));

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress(value);
  };

  const handleFavoritePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(
        isFav
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }

    if (!isFav) {
      starScale.value = withSpring(1.4, { damping: 10 }, () => {
        starScale.value = withSpring(1);
      });
      starRotation.value = withTiming(360, { duration: 500 });

      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      starScale.value = withSpring(0.8, { damping: 10 }, () => {
        starScale.value = withSpring(1);
      });
      starRotation.value = withTiming(0, { duration: 500 });
    }

    toggleFavorite(value);
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.item,
          {
            width: finalSize,
            height: finalSize,
            backgroundColor:
              scheme === "dark" ? colors.surface[100] : colors.primary[50],
          },
        ]}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <LoadingAnimation
                source={require("../assets/loading-stylebox.json")}
                size={150}
              />
            </View>
          )}

          {error ? (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? colors.surface[100]
                      : colors.primary[50],
                },
              ]}
            >
              <Feather name="x-circle" size={24} color={colors.error.DEFAULT} />
              <Text
                style={[styles.errorText, { color: colors.text.secondary }]}
              >
                Image failed to load
              </Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri }}
                style={styles.image}
                onLoadEnd={() => setLoading(false)}
                onError={handleImageError}
              />

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.gradient}
              />
            </>
          )}

          <Animated.View style={[styles.starIconContainer, starAnimatedStyle]}>
            <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.starIcon,
                  {
                    backgroundColor: isFav
                      ? "rgba(255, 215, 0, 0.3)"
                      : scheme === "dark"
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(255,255,255,0.7)",
                  },
                ]}
                onPress={handleFavoritePress}
              >
                <AntDesign
                  name={isFav ? "star" : "staro"}
                  size={18}
                  color={isFav ? "#FFD700" : colors.text.primary}
                />
              </TouchableOpacity>
            </RNAnimated.View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    margin: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
  },
  starIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
  },
  starIcon: {
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
