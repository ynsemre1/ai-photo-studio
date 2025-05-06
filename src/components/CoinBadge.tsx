import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function CoinBadge() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.surface[100] }]}
      onPress={() => router.push("/purchase")}
    >
      <Ionicons name="cart-outline" size={20} color={colors.primary[600]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});