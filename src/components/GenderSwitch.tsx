import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext"; // ← senin sistemine göre

type Gender = "male" | "female";

type Props = {
  selected: Gender;
  onChange: (gender: Gender) => void;
};

export default function GenderSwitch({ selected, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.switchContainer,
        { backgroundColor: colors.surface[100] },
      ]}
    >
      <Pressable
        onPress={() => onChange("male")}
        style={[
          styles.switchItem,
          selected === "male" && {
            backgroundColor: colors.primary[600],
          },
        ]}
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
            selected === "male" && {
              color: colors.text.inverse,
              fontWeight: "bold",
            },
          ]}
        >
          Erkek
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange("female")}
        style={[
          styles.switchItem,
          selected === "female" && {
            backgroundColor: colors.primary[600],
          },
        ]}
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
            selected === "female" && {
              color: colors.text.inverse,
              fontWeight: "bold",
            },
          ]}
        >
          Kadın
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    margin: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  switchItem: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchText: {
    fontSize: 16,
  },
});