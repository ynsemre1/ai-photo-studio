import { Slot, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../src/firebase/config";
import { syncGeneratedImagesFromStorage } from "../src/utils/saveGeneratedImage";
export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user === null) {
        router.replace("/(auth)/welcome");
      } else {
        //Kullanıcı login olduysa sadece 1 defa Storage eşitlemesi yap
        syncGeneratedImagesFromStorage(user.uid);
      }
    }
  }, [loading, user]);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: false,
      }}
    />
  );
}