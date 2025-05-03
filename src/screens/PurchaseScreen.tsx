import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const coinPackages = [
  { id: "1", amount: 100, price: "₺19,99" },
  { id: "2", amount: 250, price: "₺39,99" },
  { id: "3", amount: 500, price: "₺69,99" },
  { id: "4", amount: 1000, price: "₺99,99" },
];

export default function PurchaseScreen() {
  const handlePurchase = (pack: typeof coinPackages[0]) => {
    console.log(`Satın al: ${pack.amount} coin - ${pack.price}`);
    // TODO: Ürün ID'ye göre InAppPurchases başlat
  };

  const renderItem = ({ item }: { item: typeof coinPackages[0] }) => (
    <TouchableOpacity
      style={styles.cardShadow}
      onPress={() => handlePurchase(item)}
    >
      <LinearGradient
        colors={["#7B5EFF", "#5B45E2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Ionicons name="logo-bitcoin" size={28} color="#fff" />
        <Text style={styles.coinText}>{item.amount} Coin</Text>
        <Text style={styles.priceText}>{item.price}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💎 Coin Paketleri</Text>
      <FlatList
        data={coinPackages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#130057",
    textAlign: "center",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  card: {
    width: screenWidth - 40,
    alignSelf: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  coinText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 4,
  },
});