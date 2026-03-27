import { useRef, useCallback } from "react";
import type { BootstrapResponse } from "../types/analysis";

interface UseBootstrapPollingOptions {
  endpoint: string;
  interval?: number;
  onComplete: (response: BootstrapResponse) => void;
  onError: (error: Error) => void;
}

export function useBootstrapPolling({
  endpoint,
  interval = 2000,
  onComplete,
  onError,
}: UseBootstrapPollingOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (runId: string) => {
      stopPolling();

      const controller = new AbortController();
      abortRef.current = controller;

      const poll = async () => {
        try {
          const res = await fetch(`${endpoint}/${runId}/status`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Bootstrap poll failed: ${res.status}`);

          const data: BootstrapResponse = await res.json();

          if (data.kind === "report" || data.kind === "queued") {
            stopPolling();
            onComplete(data);
          }
          // "processing" -> keep polling
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          stopPolling();
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      };

      // Initial poll immediately
      poll();
      timerRef.current = setInterval(poll, interval);
    },
    [endpoint, interval, onComplete, onError, stopPolling]
  );

  return { startPolling, stopPolling };
}
