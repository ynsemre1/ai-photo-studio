import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";
import { useTheme } from "../../src/context/ThemeContext";

export default function StyleScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const { colors } = useTheme();
  const styleList = styleData?.style || [];

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
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