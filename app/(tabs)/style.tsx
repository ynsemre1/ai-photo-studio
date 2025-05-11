"use client";
import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useStyleData } from "../../src/context/StyleDataProvider";
import StyleBox from "../../src/components/StyleBox";
import { useTheme } from "../../src/context/ThemeContext";
import GenderSwitch from "../../src/components/GenderSwitch";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function StyleScreen() {
  const router = useRouter();
  const styleData = useStyleData();
  const { colors, scheme } = useTheme();

  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");
  const [visibleCount, setVisibleCount] = useState(16);

  if (!styleData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading styles...</Text>
      </View>
    );
  }

  const filteredList = (styleData.style || []).filter(
    (item) => item.gender === selectedGender
  );

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  const loadMore = () => {
    if (visibleCount < filteredList.length) {
      setVisibleCount((prev) => prev + 16);
    }
  };

  const memoizedFlatList = useMemo(() => (
    <FlatList
      key={selectedGender} // Gender değişince FlatList baştan render olur
      data={filteredList.slice(0, visibleCount)}
      renderItem={({ item }) => (
        <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
      )}
      keyExtractor={(item, index) => `${selectedGender}-${index}`}
      numColumns={2}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={12}
      maxToRenderPerBatch={16}
      windowSize={7}
      removeClippedSubviews={true}
    />
  ), [filteredList, selectedGender, visibleCount]);

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
        <Animated.View entering={FadeIn.duration(250)} style={styles.headerContainer}>
          <Text style={[styles.headerText, { color: colors.text.primary }]}>
            Style Gallery
          </Text>
          <Text style={[styles.headerSubtext, { color: colors.text.secondary }]}>
            Select styles by gender
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(250)} style={styles.controlsContainer}>
          <GenderSwitch
            selected={selectedGender}
            onChange={(gender) => {
              setSelectedGender(gender);
              setVisibleCount(16); // Gender değişiminde listeyi başa sar
            }}
          />
        </Animated.View>

        {filteredList.length > 0 ? (
          memoizedFlatList
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="image" size={60} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No styles available for {selectedGender === "male" ? "men" : "women"}.
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18 },
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