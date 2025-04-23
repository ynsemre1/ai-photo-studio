import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";

export default function StyleScreen() {
  //TODO: This function will be reused in three different places.
  //TODO: Consider extracting it into a separate .tsx component for better
  //TODO: reusability and maintainability.
  //TODO: Need to add loading indicator
  //TODO: Before opening style.tsx, search for cached data in IndexedDB (or local storage)
  const router = useRouter();
  const styleData = useStyleData();
  const styleList = styleData?.style || [];

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={styleList}
        renderItem={({ item, index }) => (
          <StyleBox
            uri={item.uri}
            value={item.value}
            onPress={handlePress}
          />
        )}
        keyExtractor={(item, index) => `style-${index}`}
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
