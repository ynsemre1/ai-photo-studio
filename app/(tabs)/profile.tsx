import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { router } from "expo-router";

export default function ProfileScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // yönlendirme yapma! app/_layout.tsx zaten yönlendirecek
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        {/* İstersen buraya avatar ekleriz */}
      </View>

      <View style={styles.content}>
        <Text style={styles.infoLabel}>Welcome, User 👋</Text>
        <View style={styles.coinRow}>
          <Image
            source={require("../../src/assets/coin.png")}
            style={styles.coinIcon}
          />
          <Text style={styles.coinText}>8 Coins</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#7B5EFF",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  headerText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  infoLabel: {
    fontSize: 18,
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  
  coinText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
