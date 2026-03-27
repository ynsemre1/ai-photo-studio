import { getAuth } from "firebase/auth";
import { emitSessionExpired } from "./sessionEvents";

function clearSession(): void {
  const auth = getAuth();
  auth.signOut().catch(() => {});
}

async function getIdToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function refreshToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken(true);
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getIdToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401 && token) {
    try {
      const newToken = await refreshToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      }
    } catch {
      clearSession();
      emitSessionExpired();
      return response;
    }

    if (response.status === 401) {
      clearSession();
      emitSessionExpired();
    }
  }

  return response;
}
