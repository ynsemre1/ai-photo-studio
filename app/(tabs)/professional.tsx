import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../src/firebase/config";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";

export default function ProfessionalScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const [professionalList, setProfessionalList] = useState<
    { id: string; uri: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetch = async () => {
      if (!styleData) return;

      const list = await Promise.all(
        styleData.professional.map(async (item, index) => {
          const path = `styles/professional/${item.filename}`;
          const uri = await getDownloadURL(ref(storage, path));
          return {
            id: `pro-${index}`,
            uri,
            value: item.value,
          };
        })
      );

      setProfessionalList(list);
    };

    fetch();
  }, [styleData]);

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={professionalList}
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