import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";

export default function CarScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const carList = styleData?.car || [];

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={carList}
        renderItem={({ item }) =>
          item && item.uri && item.value ? (
            <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
          ) : null
        }
        keyExtractor={(item, index) => `car-${index}`}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
