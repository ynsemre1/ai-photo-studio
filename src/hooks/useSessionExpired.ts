import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { onSessionExpired } from "../api/sessionEvents";

export function useSessionExpired(): void {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      Alert.alert(
        "Oturum Suresi Doldu",
        "Oturumunuz sona erdi. Lutfen tekrar giris yapin.",
        [
          {
            text: "Tamam",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    });

    return unsubscribe;
  }, [router]);
}
