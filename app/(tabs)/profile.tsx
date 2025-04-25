import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { signOut, getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/firebase/config";
import { useFavorites } from "../../src/context/FavoriteContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();
  const favoriteCount = favorites.length;
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserInfo(snap.data());
        }
      } catch (err) {
        console.log("🔥 Firestore kullanıcı verisi çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#7B5EFF" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.username}>{userInfo?.username || ""}</Text>
          <Text style={styles.email}>{userInfo?.email || user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userInfo?.coins || 0}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favoriler</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {userInfo?.generatedCount || 0}
            </Text>
            <Text style={styles.statLabel}>Üretimler</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Ionicons
            name="settings-outline"
            size={20}
            color="#333"
            style={styles.icon}
          />
          <Text style={styles.sectionText}>Ayarlar</Text>
        </View>

        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => router.push("/profile/PrivacyScreen")}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#333"
            style={styles.icon}
          />
          <Text style={styles.sectionText}>Gizlilik Politikası</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#7B5EFF",
    alignItems: "center",
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7B5EFF",
  },
  headerSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  email: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginVertical: 24,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "90%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: "#FFD700",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
