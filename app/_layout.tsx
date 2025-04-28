import { Slot, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../src/firebase/config";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function ThemeSwitchButton() {
  const { toggle, scheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggle}
      style={{
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 999,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 8,
        borderRadius: 20,
      }}
    >
      <Ionicons
        name={scheme === "dark" ? "sunny-outline" : "moon-outline"}
        size={24}
        color="#FFD700"
      />
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    []
  );

  useEffect(() => {
    if (!ready) return;

    if (user) {
      if (
        pathname === "/welcome" ||
        pathname === "/login" ||
        pathname === "/register"
      ) {
        router.replace("/");
      }
    } else {
      if (
        pathname === "/" ||
        pathname === "/car" ||
        pathname === "/style" ||
        pathname === "/professional" ||
        pathname === "/profile"
      ) {
        router.replace("/welcome");
      }
    }
  }, [ready, user, pathname]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }}>
        <Slot />
        <ThemeSwitchButton />
      </View>
    </ThemeProvider>
  );
}