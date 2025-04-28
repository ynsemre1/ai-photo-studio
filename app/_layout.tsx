// app/_layout.tsx
import { Slot, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../src/firebase/config";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // auth control
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    []
  );

  // 2) Yönlendirme
  useEffect(() => {
    if (!ready) return;

    if (user) {
      if (
        pathname === "/welcome" ||
        pathname === "/login" ||
        pathname === "/register"
      ) {
        router.replace("/"); // Home = /(tabs)/index
      }
    } else {
      // Çıkış yaptıysa korumalı ekranlara girmesin
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

  if (!ready) return null; // For the splash screen

  return <Slot />;
}
