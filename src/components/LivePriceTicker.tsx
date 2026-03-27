import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLiveTicker } from "../hooks/useLiveTicker";

type LivePriceTickerProps = {
  symbol: string;
};

export const LivePriceTicker: React.FC<LivePriceTickerProps> = ({ symbol }) => {
  const { data, status, retry } = useLiveTicker(symbol);

  if (status === "failed") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Connection lost</Text>
        <TouchableOpacity onPress={retry} style={styles.retryButton}>
          <Text style={styles.retryText}>Reconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === "connecting" || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    );
  }

  const changeNum = parseFloat(data.change24h);
  const isPositive = changeNum >= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>{data.symbol}</Text>
      <Text style={styles.price}>${parseFloat(data.price).toLocaleString()}</Text>
      <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
        {isPositive ? "+" : ""}
        {changeNum.toFixed(2)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  symbol: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  price: {
    fontSize: 14,
    color: "#fff",
  },
  change: {
    fontSize: 12,
    fontWeight: "500",
  },
  positive: {
    color: "#4caf50",
  },
  negative: {
    color: "#f44336",
  },
  loadingText: {
    fontSize: 12,
    color: "#aaa",
  },
  errorText: {
    fontSize: 12,
    color: "#f44336",
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  retryText: {
    fontSize: 12,
    color: "#fff",
  },
});
