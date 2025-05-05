import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useState } from "react"
import Animated, { FadeInDown } from "react-native-reanimated"

const screenWidth = Dimensions.get("window").width

const coinPackages = [
  { id: "1", amount: 100, price: "₺19,99", popular: false },
  { id: "2", amount: 250, price: "₺39,99", popular: true },
  { id: "3", amount: 500, price: "₺69,99", popular: false },
  { id: "4", amount: 1000, price: "₺99,99", popular: false },
]

export default function PurchaseScreen() {
  const { colors, scheme } = useTheme()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handlePurchase = (pack: (typeof coinPackages)[0]) => {
    console.log(`Satın al: ${pack.amount} coin - ${pack.price}`)
    setSelectedPackage(pack.id)
    // TODO: Ürün ID'ye göre InAppPurchases başlat
  }

  const renderItem = ({ item, index }: { item: (typeof coinPackages)[0]; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity
        style={[
          styles.cardShadow,
          {
            borderColor: selectedPackage === item.id ? colors.primary.DEFAULT : "transparent",
            borderWidth: selectedPackage === item.id ? 2 : 0,
          },
        ]}
        onPress={() => handlePurchase(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            scheme === "dark"
              ? [colors.primary[800], colors.primary[700]]
              : [colors.primary[500], colors.primary[600]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {item.popular && (
            <View style={[styles.popularBadge, { backgroundColor: colors.success.DEFAULT }]}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          )}

          <View style={styles.coinIconContainer}>
            <Image source={require("../assets/coin.png")} style={styles.coinImage} />
          </View>

          <Text style={styles.coinText}>{item.amount} Coin</Text>
          <Text style={styles.priceText}>{item.price}</Text>

          <View style={[styles.buyButton, { backgroundColor: colors.bg.DEFAULT }]}>
            <Text style={[styles.buyButtonText, { color: colors.text.primary }]}>Purchase</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Coin Packages</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Purchase coins to generate more images
        </Text>
      </View>

      <FlatList
        data={coinPackages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>
          Coins are used to generate AI images. Each image costs 1 coin.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  card: {
    width: screenWidth - 40,
    alignSelf: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  coinIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  coinImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  coinText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    opacity: 0.9,
  },
  buyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
  },
})
