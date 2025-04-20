import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../src/firebase/config";

export default function StyleScreen() {
  const [stylesData, setStylesData] = useState<
    { id: string; value: string; uri: string }[]
  >([]);

  useEffect(() => {
    const fetchStyles = async () => {
      const querySnapshot = await getDocs(collection(db, "styles"));
      const results = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const value = doc.data().value;
          const imageRef = ref(storage, `styles/${value}.png`);
          const uri = await getDownloadURL(imageRef);
          return { id: doc.id, value, uri };
        })
      );
      setStylesData(results);
    };

    fetchStyles();
  }, []);

  const renderItem = ({
    item,
  }: {
    item: { id: string; value: string; uri: string };
  }) => (
    <TouchableOpacity style={styles.itemBox}>
      <Image source={{ uri: item.uri }} style={styles.itemImage} />
      <Text style={styles.itemText}>{item.value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={stylesData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemBox: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  itemImage: {
    width: "100%",
    height: 150,
  },
  itemText: {
    textAlign: "center",
    padding: 8,
    fontWeight: "600",
  },
});
