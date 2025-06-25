import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { auth } from "../config";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";

export function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "GOOGLE_CLIENT_ID",
  });

  useEffect(() => {
    const doLogin = async () => {
      if (response?.type === "success") {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      }
    };

    doLogin();
  }, [response]);

  return { promptAsync };
}