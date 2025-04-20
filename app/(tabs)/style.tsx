import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../src/firebase/config";
import StyleBox from "../../src/components/StyleBox";

export default function StyleScreen() {
  const [stylesData, setStylesData] = useState<
    { id: string; value: string; uri: string }[]
  >([]);

  useEffect(() => {
    
    //TODO: This function will be reused in three different places. 
    //TODO: Consider extracting it into a separate .tsx component for better 
    //TODO: reusability and maintainability.

    //TODO: Need to add loading indicator
    
    const fetchStyles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "styles"));
        const results = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const filename = doc.data().filename;
            const imageRef = ref(storage, `styles/${filename}.png`);
            const uri = await getDownloadURL(imageRef);
            return { id: doc.id, value: doc.data().value, uri };
          })
        );
        setStylesData(results);
      } catch (error) {
        console.error("🔥 fetchStyles error:", error);
      }
    };

    fetchStyles();
  }, []);

  const handlePress = (value: string) => {
    // 👇 Fotoğraf tıklanınca yapılacak işlem (yönlendirme vs)
    console.log("Clicked style value:", value);
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