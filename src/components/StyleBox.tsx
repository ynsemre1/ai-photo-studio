import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoriteContext";

const screenWidth = Dimensions.get("window").width;
export const boxSize = (screenWidth - 48) / 2; // dışarıdan import edilebilir

type Props = {
  uri: string;
  value: string;
  onPress: (value: string) => void;
  size?: number;
};

export default function StyleBox({ uri, value, onPress, size }: Props) {
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  const finalSize = size ?? boxSize;

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={[styles.item, { width: finalSize, height: finalSize }]}
    >
      <View style={styles.imageWrapper}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
        <Image
          source={{ uri }}
          style={styles.image}
          onLoadEnd={() => setLoading(false)}
        />
        <TouchableOpacity
          style={styles.starIcon}
          onPress={() => toggleFavorite(value)}
        >
          <AntDesign
            name={isFavorite(value) ? "star" : "staro"}
            size={20}
            color={isFavorite(value) ? "#FFD700" : "#fff"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  starIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
  },
});