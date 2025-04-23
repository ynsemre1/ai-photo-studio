import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
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
    console.log("🧩 Gelen professional verisi:", styleData?.professional);

    const fetch = async () => {
      if (!styleData || styleData.professional.length === 0) {
        console.log("⚠️ Professional context boş ya da veri yok");
        return;
      }

      const list = await Promise.all(
        styleData.professional.map(async (item, index) => {
          try {
            const path = `styles/professional/${item.filename}`;
            console.log("📁 Storage yolu:", path);
            const uri = await getDownloadURL(ref(storage, path));
            console.log("✅ URL:", uri);
            return {
              id: `pro-${index}`,
              uri,
              value: item.value,
            };
          } catch (err) {
            console.log("🚫 getDownloadURL hatası:", item.filename, err);
            return {
              id: `pro-${index}`,
              uri: "",
              value: item.value,
            };
          }
        })
      );

      setProfessionalList(list.filter((item) => item.uri !== ""));
    };

    fetch();
  }, [styleData]);

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      {professionalList.length === 0 ? (
        <Text style={{ marginTop: 40 }}>⏳ Yükleniyor...</Text>
      ) : (
        <FlatList
          data={professionalList}
          renderItem={({ item }) => (
            <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />
      )}
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