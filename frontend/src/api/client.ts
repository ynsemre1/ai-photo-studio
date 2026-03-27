const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

export function saveSession(token: string): void {
  sessionStorage.setItem("auth_token", token);
}

export function clearSession(): void {
  sessionStorage.removeItem("auth_token");
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem("auth_token");
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
