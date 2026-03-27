import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Application from "expo-application";
import { Platform } from "react-native";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

// ---------- Constants ----------

const GUEST_ANALYZE_USED_KEY = "guest_analyze_used";
const GUEST_TOKEN_KEY = "guest_token";

const GUEST_LIMIT_ENABLED = !__DEV__;

// ---------- Device Fingerprint ----------

/**
 * Returns a stable device/installation identifier that survives
 * AsyncStorage.clear() on Android (androidId is hardware-bound)
 * and is as persistent as possible on iOS.
 *
 * This is sent alongside the guest token so the backend can enforce
 * limits per-device even when the guest token is regenerated.
 */
export async function getDeviceId(): Promise<string> {
  if (Platform.OS === "android") {
    return Application.getAndroidId() ?? "unknown-android";
  }

  // iOS: use installationId (persists until app reinstall)
  const iosId = await Application.getInstallationIdAsync();
  return iosId;
}

// ---------- Guest Token ----------

/**
 * Ensures a guest token exists in AsyncStorage.
 * Format: "guest_<UUID>"
 *
 * NOTE: This token alone is NOT sufficient for security.
 * The backend MUST also validate via X-Device-Id header
 * (see getDeviceId) to prevent bypass via token regeneration.
 */
export async function ensureGuestToken(): Promise<string> {
  const existing = await AsyncStorage.getItem(GUEST_TOKEN_KEY);
  if (existing) return existing;

  const uuid = Crypto.randomUUID();
  const token = `guest_${uuid}`;
  await AsyncStorage.setItem(GUEST_TOKEN_KEY, token);
  return token;
}

// ---------- Local Guest Analyze State ----------

/**
 * Fast-path local check. Used as UI optimization only — NEVER as
 * the sole security guard. The server is the source of truth.
 */
export function hasConsumedGuestAnalyze(): boolean {
  // Synchronous check not possible with AsyncStorage;
  // use hasConsumedGuestAnalyzeAsync instead.
  // Kept for API compatibility — always returns false so callers
  // fall through to the async server check.
  if (!GUEST_LIMIT_ENABLED) return false;
  return false;
}

/**
 * Async version that actually reads AsyncStorage.
 * Still only a local cache — server is authoritative.
 */
export async function hasConsumedGuestAnalyzeAsync(): Promise<boolean> {
  if (!GUEST_LIMIT_ENABLED) return false;
  const value = await AsyncStorage.getItem(GUEST_ANALYZE_USED_KEY);
  return value === "1";
}

export async function markGuestAnalyzeConsumed(): Promise<void> {
  await AsyncStorage.setItem(GUEST_ANALYZE_USED_KEY, "1");
}

// ---------- Server-Side Eligibility Check ----------

export type GuestEligibilityResult = {
  eligible: boolean;
  reason?: "guest_limit" | "error";
};

/**
 * Asks the backend whether this guest is still eligible for a
 * free analyze. Sends both guest token AND device fingerprint
 * so the backend can enforce limits even if the token was
 * regenerated (localStorage / AsyncStorage cleared).
 */
export async function checkGuestEligibility(): Promise<GuestEligibilityResult> {
  try {
    const [guestToken, deviceId] = await Promise.all([
      ensureGuestToken(),
      getDeviceId(),
    ]);

    const checkFn = httpsCallable(functions, "check_guest_eligibility");
    const response = await checkFn({
      guestToken,
      deviceId,
    });

    const data = response.data as { eligible: boolean };
    return { eligible: data.eligible, reason: data.eligible ? undefined : "guest_limit" };
  } catch {
    // Network error — let the actual analyze call handle it
    return { eligible: true };
  }
}

// ---------- Analyze ----------

export type AnalyzeResult =
  | { kind: "success"; data: unknown }
  | { kind: "guest_limit" }
  | { kind: "error"; message: string };

/**
 * Posts an analyze request. For guests, sends both the guest token
 * and device fingerprint. Handles the guest_limit response from
 * the backend and marks local state accordingly.
 */
export async function postAnalyze(
  file: Blob,
  prompt: string,
  uid?: string
): Promise<AnalyzeResult> {
  try {
    const isGuest = !uid || uid === "anon";

    const params: Record<string, unknown> = { prompt };

    if (isGuest) {
      const [guestToken, deviceId] = await Promise.all([
        ensureGuestToken(),
        getDeviceId(),
      ]);
      params.guestToken = guestToken;
      params.deviceId = deviceId;
    }

    const analyzeFn = httpsCallable(functions, "analyze_image");
    const response = await analyzeFn(params);

    const data = response.data as Record<string, unknown>;

    // Backend signals guest limit reached
    if (data.kind === "guest_limit") {
      await markGuestAnalyzeConsumed();
      return { kind: "guest_limit" };
    }

    // Success — mark consumed locally for fast-path UI
    if (isGuest) {
      await markGuestAnalyzeConsumed();
    }

    return { kind: "success", data };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { kind: "error", message };
  }
}
