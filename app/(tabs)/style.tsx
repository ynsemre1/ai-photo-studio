import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";
import { useTheme } from "../../src/context/ThemeContext";
import GenderSwitch from "../../src/components/GenderSwitch";
import CoinBadge from "../../src/components/CoinBadge";

export default function StyleScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const { colors } = useTheme();

  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");

  // TODO: open styleList, when firebase gender add
  // const styleList = (styleData?.style || []).filter(item => item.gender === selectedGender);
  const styleList = styleData?.style || [];

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      <View style={styles.topRowCentered}>
        <GenderSwitch selected={selectedGender} onChange={setSelectedGender} />
        <View style={{ width: 12 }} />
        <CoinBadge />
      </View>

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
  container: {
    flex: 1,
  },
  headerWrapper: {
    alignItems: "center", // ortalar
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  topRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 320, // ya da 90% gibi dinamik bir şey verebilirsin
    width: "100%",
    justifyContent: "space-between",
  },
  gridContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});