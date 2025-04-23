import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";

export default function ProfessionalScreen() {
  const router = useRouter();
  const styleData = useStyleData();

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  const professionalList = styleData?.professional || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={professionalList}
        renderItem={({ item, index }) => (
          <StyleBox
            uri={item.uri}
            value={item.value}
            onPress={handlePress}
          />
        )}
        keyExtractor={(item, index) => `pro-${index}`}
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
