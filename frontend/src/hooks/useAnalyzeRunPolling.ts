import { useRef, useCallback } from "react";
import type { AnalyzeRunStatus } from "../types/analysis";

interface UseAnalyzeRunPollingOptions {
  endpoint: string;
  interval?: number;
  onReport: (data: AnalyzeRunStatus) => void;
  onError: (error: Error) => void;
}

export function useAnalyzeRunPolling({
  endpoint,
  interval = 3000,
  onReport,
  onError,
}: UseAnalyzeRunPollingOptions) {
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
          if (!res.ok) throw new Error(`Analyze poll failed: ${res.status}`);

          const data: AnalyzeRunStatus = await res.json();

          if (data.status === "completed" || data.status === "failed") {
            stopPolling();
            onReport(data);
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          stopPolling();
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      };

      poll();
      timerRef.current = setInterval(poll, interval);
    },
    [endpoint, interval, onReport, onError, stopPolling]
  );

  return { startPolling, stopPolling };
}
