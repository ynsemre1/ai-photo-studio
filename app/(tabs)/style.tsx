"use client";

import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";
import { useTheme } from "../../src/context/ThemeContext";
import GenderSwitch from "../../src/components/GenderSwitch";
import CoinBadge from "../../src/components/CoinBadge";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function StyleScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const { colors, scheme } = useTheme();

  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");
  const [visibleCount, setVisibleCount] = useState(16);

  const filteredList =
    (styleData?.style || []).filter((item) => item.gender === selectedGender) || [];

  const loadMore = () => {
    if (visibleCount < filteredList.length) {
      setVisibleCount((prev) => prev + 16);
    }
  };

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      <LinearGradient
        colors={
          scheme === "dark"
            ? [colors.bg.DEFAULT, colors.primary[900]]
            : [colors.bg.DEFAULT, colors.primary[50]]
        }
        style={{ flex: 1 }}
      >
        {/* Header with soft fade */}
        <Animated.View entering={FadeIn.duration(250)} style={styles.headerContainer}>
          <Text style={[styles.headerText, { color: colors.text.primary }]}>
            Style Gallery
          </Text>
          <Text style={[styles.headerSubtext, { color: colors.text.secondary }]}>
            Choose a style for your transformation
          </Text>
        </Animated.View>

        {/* Controls section with fade */}
        <Animated.View entering={FadeIn.duration(250)} style={styles.controlsContainer}>
          <View
            style={[
              styles.controlsWrapper,
              {
                backgroundColor: scheme === "dark" ? colors.surface[100] : colors.primary[100],
                borderColor: scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <GenderSwitch
              selected={selectedGender}
              onChange={(gender) => {
                setSelectedGender(gender);
                setVisibleCount(8); // reset count on switch
              }}
            />
            <View style={{ width: 12 }} />
            <CoinBadge />
          </View>
        </Animated.View>

        {filteredList.length > 0 ? (
          <FlatList
            data={filteredList.slice(0, visibleCount)}
            renderItem={({ item }) => (
              <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
            )}
            keyExtractor={(item) => item.uri}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="image" size={60} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No styles available for {selectedGender === "male" ? "men" : "women"}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtext: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  controlsContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  controlsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  gridContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
  },
});