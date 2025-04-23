import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../src/firebase/config";
import StyleBox from "../../src/components/StyleBox";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";

export default function StyleScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const [stylesData, setStylesData] = useState<
    { id: string; value: string; uri: string }[]
  >([]);

  useEffect(() => {
    //TODO: This function will be reused in three different places.
    //TODO: Consider extracting it into a separate .tsx component for better
    //TODO: reusability and maintainability.
    //TODO: Need to add loading indicator
    //TODO: Before opening style.tsx, search for cached data in IndexedDB (or local storage)

    const fetchUrls = async () => {
      if (!styleData) return;

      const list = await Promise.all(
        styleData.style.map(async (item, index) => {
          const path = `styles/style/${item.filename}`;
          const uri = await getDownloadURL(ref(storage, path));
          return {
            id: `style-${index}`,
            uri,
            value: item.value,
          };
        })
      );

      setStylesData(list);
    };

    fetchUrls();
  }, [styleData]);

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={stylesData}
        renderItem={({ item }) => (
          <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
        )}
        keyExtractor={(item) => item.id}
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