import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CarScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const carList = styleData?.car || [];

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <SafeAreaView style={styles.safeArea}> {/* 🧱 */}
      <View style={styles.container}>
        <FlatList
          data={carList}
          renderItem={({ item }) => (
            <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
          )}
          keyExtractor={(_, index) => `car-${index}`}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // Arka planın boş kalmaması için
  },
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});