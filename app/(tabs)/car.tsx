import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../src/firebase/config";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";

export default function CarScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const [carList, setCarList] = useState<
    { id: string; uri: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchUrls = async () => {
      if (!styleData) return;

      const list = await Promise.all(
        styleData.car.map(async (item, index) => {
          const filePath = `styles/car/${item.filename}`;
          const url = await getDownloadURL(ref(storage, filePath));

          return {
            id: `car-${index}`,
            uri: url,
            value: item.value,
          };
        })
      );

      setCarList(list);
    };

    fetchUrls();
  }, [styleData]);

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={carList}
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