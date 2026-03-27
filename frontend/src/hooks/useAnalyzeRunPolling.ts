import { useCallback, useEffect, useRef, useState } from "react";

const POLLING_INTERVAL_MS = 4_000;
const POLLING_TIMEOUT_MS = 10 * 60 * 1_000; // 10 minutes

interface AnalyzeRun {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  reportUrl?: string;
  [key: string]: unknown;
}

interface UseAnalyzeRunPollingOptions {
  failedMessage: string;
  timeoutMessage: string;
  onReport: (data: AnalyzeRun) => void;
  onError: (error: string) => void;
  onSettled?: () => void;
}

interface UseAnalyzeRunPollingReturn {
  activeAnalyzeRun: AnalyzeRun | null;
  startAnalyzeRunPolling: (run: AnalyzeRun) => void;
}

async function fetchAnalyzeRunStatus(runId: string): Promise<AnalyzeRun> {
  const response = await fetch(`/api/analyze-runs/${runId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analyze run status: ${response.status}`);
  }
  return response.json();
}

export function useAnalyzeRunPolling({
  failedMessage,
  timeoutMessage,
  onReport,
  onError,
  onSettled,
}: UseAnalyzeRunPollingOptions): UseAnalyzeRunPollingReturn {
  const [activeAnalyzeRun, setActiveAnalyzeRun] = useState<AnalyzeRun | null>(
    null
  );

  // -- Fix: store callbacks in refs so the polling effect does not depend on
  //    their referential identity.  Parent components can pass inline arrows
  //    without causing the interval to reset on every render.
  const onReportRef = useRef(onReport);
  const onErrorRef = useRef(onError);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    onReportRef.current = onReport;
  }, [onReport]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  const clearActiveAnalyzeRun = useCallback(() => {
    setActiveAnalyzeRun(null);
  }, []);

  const startAnalyzeRunPolling = useCallback((run: AnalyzeRun) => {
    setActiveAnalyzeRun(run);
  }, []);

  // Polling effect
  useEffect(() => {
    if (!activeAnalyzeRun) return;

    let pollCount = 0;
    const maxPolls = Math.floor(POLLING_TIMEOUT_MS / POLLING_INTERVAL_MS);

    const intervalId = setInterval(async () => {
      pollCount += 1;

      if (pollCount > maxPolls) {
        clearInterval(intervalId);
        onErrorRef.current(timeoutMessage);
        onSettledRef.current?.();
        clearActiveAnalyzeRun();
        return;
      }

      try {
        const data = await fetchAnalyzeRunStatus(activeAnalyzeRun.id);

        if (data.status === "completed") {
          clearInterval(intervalId);
          onReportRef.current(data);
          onSettledRef.current?.();
          clearActiveAnalyzeRun();
          return;
        }

        if (data.status === "failed") {
          clearInterval(intervalId);
          onErrorRef.current(failedMessage);
          onSettledRef.current?.();
          clearActiveAnalyzeRun();
          return;
        }

        // Still pending/processing — update local state and continue polling
        setActiveAnalyzeRun(data);
      } catch {
        clearInterval(intervalId);
        onErrorRef.current(failedMessage);
        onSettledRef.current?.();
        clearActiveAnalyzeRun();
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeAnalyzeRun, clearActiveAnalyzeRun, failedMessage, timeoutMessage]);

  return { activeAnalyzeRun, startAnalyzeRunPolling };
}
