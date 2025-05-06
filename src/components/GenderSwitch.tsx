import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Gender = "male" | "female";

type Props = {
  selected: Gender;
  onChange: (gender: Gender) => void;
};

export default function GenderSwitch({ selected, onChange }: Props) {
  return (
    <View style={styles.switchContainer}>
      <Pressable
        onPress={() => onChange("male")}
        style={[
          styles.switchItem,
          selected === "male" && styles.switchItemSelected,
        ]}
      >
        <Ionicons
          name="male"
          size={18}
          color={selected === "male" ? "#fff" : "#555"}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.switchText,
            selected === "male" && styles.switchTextSelected,
          ]}
        ></Text>
      </Pressable>

      <Pressable
        onPress={() => onChange("female")}
        style={[
          styles.switchItem,
          selected === "female" && styles.switchItemSelected,
        ]}
      >
        <Ionicons
          name="female"
          size={18}
          color={selected === "female" ? "#fff" : "#555"}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.switchText,
            selected === "female" && styles.switchTextSelected,
          ]}
        ></Text>
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
    backgroundColor: "#eee",
  },
  switchItem: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchItemSelected: {
    backgroundColor: "#7B5EFF",
  },
  switchText: {
    fontSize: 16,
    color: "#555",
  },
  switchTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});
