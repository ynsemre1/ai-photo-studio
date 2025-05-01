import { Slot, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../src/firebase/config";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  const [hasRedirected, setHasRedirected] = useState(false);

useEffect(() => {
  if (!ready) return;
  
  const isAuthPage =
    pathname === "/welcome" || pathname === "/login" || pathname === "/register";

  const isProtectedRoute =
    pathname === "/" ||
    pathname === "/car" ||
    pathname === "/style" ||
    pathname === "/professional" ||
    pathname === "/profile";

  if (user) {
    if (!user.emailVerified && pathname !== "/(auth)/login" && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/(auth)/login");
    } else if (user.emailVerified && isAuthPage && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/");
    }
  } else {
    if (isProtectedRoute && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/(auth)/welcome");
    }
  }
}, [ready, user, pathname]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <ThemedRoot />
    </ThemeProvider>
  );
}

function ThemedRoot() {
  const { colors, scheme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <StatusBar
        style={scheme === "dark" ? "light" : "dark"}
        backgroundColor={colors.bg.DEFAULT}
      />
      <View style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}