// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

// ---- Types ----------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface AnalyzeRequest {
  symbol: string;
  interval: string;
  strategy?: string;
}

export type AnalyzeResponse =
  | { kind: "report"; data: AnalyzeReport }
  | { kind: "queued"; jobId: string }
  | { kind: "bootstrapping"; progress: number }
  | { kind: "symbol_not_found" }
  | { kind: "data_not_ready" }
  | { kind: "guest_limit" };

export interface AnalyzeReport {
  symbol: string;
  interval: string;
  summary: string;
  score: number;
  signals: Signal[];
  generatedAt: string;
}

export interface Signal {
  name: string;
  value: number;
  interpretation: string;
}

export interface GetCandlesParams {
  symbol: string;
  interval: string;
  limit?: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlesResponse {
  candles: Candle[];
}

export interface BootstrapStatus {
  ready: boolean;
  progress: number;
  message: string;
}

// ---- Auth token store -----------------------------------------------------

let authToken: string | null = null;

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null): void {
  authToken = token;
}

// ---- Low-level helpers ----------------------------------------------------

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function executeRequest(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: "include",
  });
}

// ---- Token refresh --------------------------------------------------------

async function refreshToken(): Promise<boolean> {
  try {
    const res = await executeRequest(buildUrl("/auth/refresh"), {
      method: "POST",
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAuthToken(data.token);
    return true;
  } catch {
    return false;
  }
}

// ---- Core fetcher with automatic 401 retry --------------------------------

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = buildUrl(path);

  const headers = new Headers(init.headers);
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  let response = await executeRequest(url, { ...init, headers });

  // Automatic token refresh on 401 — only for authenticated users
  if (response.status === 401 && getAuthToken() !== null) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${authToken}`);
      response = await executeRequest(url, { ...init, headers });
    } else {
      window.location.href = "/login";
      throw new ApiError("Session expired", 401);
    }
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(body || response.statusText, response.status);
  }

  return response.json() as Promise<T>;
}

// ---- API functions --------------------------------------------------------

/**
 * POST /analyze
 *
 * Returns various response shapes depending on server state.
 * Uses executeRequest (not raw fetch) so that:
 *   - credentials: "include" is set (K2 fix)
 *   - We can leverage the 401 token-refresh flow (K1 fix)
 */
export async function postAnalyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const url = buildUrl("/analyze");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let response = await executeRequest(url, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });

  // Token refresh on 401 — mirrors apiFetch behaviour (K1 fix)
  if (response.status === 401 && getAuthToken() !== null) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${authToken}`;
      response = await executeRequest(url, {
        method: "POST",
        headers,
        body: JSON.stringify(req),
      });
    } else {
      window.location.href = "/login";
      throw new ApiError("Session expired", 401);
    }
  }

  if (response.status === 202) {
    const body = await response.json();

    if (body.kind === "queued") {
      return { kind: "queued", jobId: body.jobId };
    }
    if (body.kind === "bootstrapping") {
      return { kind: "bootstrapping", progress: body.progress ?? 0 };
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    if (response.status === 404 && body?.code === "SYMBOL_NOT_FOUND") {
      return { kind: "symbol_not_found" };
    }
    if (response.status === 409 && body?.code === "DATA_NOT_READY") {
      return { kind: "data_not_ready" };
    }
    if (response.status === 429 && body?.code === "GUEST_LIMIT") {
      return { kind: "guest_limit" };
    }

    throw new ApiError(
      body?.message ?? response.statusText,
      response.status,
    );
  }

  const data: AnalyzeReport = await response.json();
  return { kind: "report", data };
}

// ---- Other API endpoints --------------------------------------------------

export async function getCandles(
  params: GetCandlesParams,
): Promise<CandlesResponse> {
  const query = new URLSearchParams({
    symbol: params.symbol,
    interval: params.interval,
  });
  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return apiFetch<CandlesResponse>(`/candles?${query.toString()}`, { headers });
}

export async function getBootstrapStatus(
  symbol: string,
): Promise<BootstrapStatus> {
  return apiFetch<BootstrapStatus>(
    `/bootstrap/status?symbol=${encodeURIComponent(symbol)}`,
  );
}
