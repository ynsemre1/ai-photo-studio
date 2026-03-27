// ---------------------------------------------------------------------------
// apiFetch  –  Authenticated fetch wrapper with automatic token refresh
// ---------------------------------------------------------------------------
//
// When a token refresh fails the previous approach used
//   window.location.assign("/login")
// which caused a full page reload, destroying all SPA state.
//
// Instead we now dispatch a "session-expired" CustomEvent so that the React
// tree can handle the redirect via React Router (preserving in-flight state
// long enough to show a notification).
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

// ---- Session helpers ------------------------------------------------------

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearSession(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ---- ApiError -------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---- Token refresh --------------------------------------------------------

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

/** De-duplicate concurrent refresh attempts. */
function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---- Session-expired event ------------------------------------------------

export const SESSION_EXPIRED_EVENT = "session-expired";

function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

// ---- apiFetch -------------------------------------------------------------

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const doFetch = (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...init, headers });
  };

  // First attempt
  let res = await doFetch(getAccessToken());

  // If 401, try refreshing the token exactly once
  if (res.status === 401) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      res = await doFetch(getAccessToken());
    } else {
      // Refresh failed — notify the SPA instead of hard-redirecting
      clearSession();
      dispatchSessionExpired();
      throw new ApiError(401, "SESSION_EXPIRED", "Session expired");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.code ?? "UNKNOWN",
      body.message ?? res.statusText,
    );
  }

  return res.json() as Promise<T>;
}
