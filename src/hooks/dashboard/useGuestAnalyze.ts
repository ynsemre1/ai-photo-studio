import { useState, useCallback } from "react";
import {
  hasConsumedGuestAnalyzeAsync,
  checkGuestEligibility,
  postAnalyze,
  markGuestAnalyzeConsumed,
  type AnalyzeResult,
} from "../../api/client";

type UseGuestAnalyzeOptions = {
  /** Called when the guest must sign in to continue */
  onRequireAuth: () => void;
};

type UseGuestAnalyzeReturn = {
  /** Whether an operation is in progress */
  loading: boolean;
  /** Attempt a guest analyze — validates server-side first */
  analyze: (file: Blob, prompt: string) => Promise<AnalyzeResult | null>;
};

/**
 * Hook that manages guest analyze with server-side validation.
 *
 * The local AsyncStorage check is used only as a fast-path UI
 * optimisation. The actual guard is the server-side eligibility
 * check, which uses both the guest token and device fingerprint
 * to prevent bypass via AsyncStorage clearing or incognito mode.
 *
 * Flow:
 * 1. Quick local check (hasConsumedGuestAnalyzeAsync)
 *    -> If consumed locally, skip network call, redirect to auth.
 * 2. Server eligibility check (checkGuestEligibility)
 *    -> Backend verifies by device fingerprint, not just token.
 *    -> If ineligible, mark local + redirect to auth.
 * 3. Post analyze (postAnalyze)
 *    -> If backend returns guest_limit, mark local + redirect.
 */
export function useGuestAnalyze({
  onRequireAuth,
}: UseGuestAnalyzeOptions): UseGuestAnalyzeReturn {
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(
    async (file: Blob, prompt: string): Promise<AnalyzeResult | null> => {
      setLoading(true);
      try {
        // --- Step 1: Fast-path local check ---
        const localConsumed = await hasConsumedGuestAnalyzeAsync();
        if (localConsumed) {
          onRequireAuth();
          return null;
        }

        // --- Step 2: Server-side eligibility (authoritative) ---
        const eligibility = await checkGuestEligibility();
        if (!eligibility.eligible) {
          await markGuestAnalyzeConsumed();
          onRequireAuth();
          return null;
        }

        // --- Step 3: Perform the analyze ---
        const result = await postAnalyze(file, prompt);

        if (result.kind === "guest_limit") {
          onRequireAuth();
          return null;
        }

        return result;
      } finally {
        setLoading(false);
      }
    },
    [onRequireAuth]
  );

  return { loading, analyze };
}
