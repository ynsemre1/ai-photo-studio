import * as AppleAuthentication from "expo-apple-authentication";
import { auth } from "../config";
import { signInWithCredential, OAuthProvider } from "firebase/auth";

export async function loginWithApple() {
  const provider = new OAuthProvider("apple.com");

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const appleCredential = provider.credential({
    idToken: credential.identityToken!,
  });

  await signInWithCredential(auth, appleCredential);
}
