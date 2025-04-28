import { Slot, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../src/firebase/config";

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

  useEffect(() => {
    if (!ready) return;

    if (user) {
      // ✅ Login oldun, auth ekranındaysan tabs'a at
      if (pathname.startsWith("/(auth)")) {
        router.replace("/");
      }
    } else {
      // ✅ Logout oldun, tabs ekranındaysan welcome'a at
      if (pathname === "/" || pathname.startsWith("/(tabs)")) {
        router.replace("/(auth)/welcome");
      }
    }
  }, [ready, user, pathname]);

  if (!ready) return null;

  return <Slot />;
}