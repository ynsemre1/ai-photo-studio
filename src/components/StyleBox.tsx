import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const boxSize = (screenWidth - 48) / 2;

type Props = {
  uri: string;
  value: string;
  onPress: (value: string) => void;
};

export default function StyleBox({ uri, value, onPress }: Props) {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity onPress={() => onPress(value)} style={styles.item}>
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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    width: boxSize,
    height: boxSize,
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
});