import { useState, useCallback, useRef } from "react";
import { useBootstrapPolling } from "../useBootstrapPolling";
import { useAnalyzeRunPolling } from "../useAnalyzeRunPolling";
import type { AnalyzeReport, AnalyzeRunStatus, BootstrapResponse } from "../../types/analysis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

interface UseDashboardRunOptions {
  onReport: (data: AnalyzeReport) => void;
  onError: (error: Error) => void;
}

interface UseDashboardRunReturn {
  loading: boolean;
  transitioning: boolean;
  error: Error | null;
  activeAnalyzeRun: AnalyzeRunStatus | null;
  startAnalyze: (imageId: string) => Promise<void>;
  isDisabled: boolean;
}

export function useDashboardRun({
  onReport,
  onError,
}: UseDashboardRunOptions): UseDashboardRunReturn {
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeAnalyzeRun, setActiveAnalyzeRun] = useState<AnalyzeRunStatus | null>(null);

  // Guard against double-submissions during async gaps
  const submittingRef = useRef(false);

  const analyzeRunPolling = useAnalyzeRunPolling({
    endpoint: `${API_BASE}/analyze-run`,
    onReport: (data: AnalyzeRunStatus) => {
      setActiveAnalyzeRun(null);
      setLoading(false);
      setTransitioning(false);
      submittingRef.current = false;

      if (data.status === "completed" && data.report) {
        setError(null);
        onReport(data.report);
      } else if (data.status === "failed") {
        const err = new Error("Analyze run failed");
        setError(err);
        onError(err);
      }
    },
    onError: (err: Error) => {
      setActiveAnalyzeRun(null);
      setLoading(false);
      setTransitioning(false);
      submittingRef.current = false;
      setError(err);
      onError(err);
    },
  });

  const startAnalyzeRunPolling = useCallback(
    (runId: string) => {
      setActiveAnalyzeRun({ id: runId, status: "queued" });
      analyzeRunPolling.startPolling(runId);
    },
    [analyzeRunPolling]
  );

  const handleBootstrapComplete = useCallback(
    async (response: BootstrapResponse) => {
      // BUG FIX: Set transitioning=true BEFORE any async work to prevent
      // the brief window where loading=false and activeAnalyzeRun is not yet set.
      // This closes the race condition during bootstrap -> analyze handoff.
      setTransitioning(true);

      try {
        if (response.kind === "report" && response.data) {
          // Bootstrap returned a direct report — no further polling needed
          setLoading(false);
          setTransitioning(false);
          submittingRef.current = false;
          setError(null);
          onReport(response.data);
          return;
        }

        // kind === "queued" — need to call postAnalyze
        const res = await fetch(`${API_BASE}/analyze/post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: response.runId }),
        });

        if (!res.ok) {
          throw new Error(`postAnalyze failed: ${res.status}`);
        }

        const postResult = await res.json();

        if (postResult.kind === "queued" && postResult.runId) {
          // Start analyze run polling BEFORE setting loading=false
          // This ensures activeAnalyzeRun is set and button stays disabled
          startAnalyzeRunPolling(postResult.runId);
          setLoading(false);
          setTransitioning(false);
        } else if (postResult.kind === "report" && postResult.data) {
          setLoading(false);
          setTransitioning(false);
          submittingRef.current = false;
          setError(null);
          onReport(postResult.data);
        }
      } catch (err) {
        setLoading(false);
        setTransitioning(false);
        submittingRef.current = false;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError(error);
      }
    },
    [onReport, onError, startAnalyzeRunPolling]
  );

  const bootstrapPolling = useBootstrapPolling({
    endpoint: `${API_BASE}/bootstrap`,
    onComplete: handleBootstrapComplete,
    onError: (err: Error) => {
      setLoading(false);
      setTransitioning(false);
      submittingRef.current = false;
      setError(err);
      onError(err);
    },
  });

  const startAnalyze = useCallback(
    async (imageId: string) => {
      // Prevent double-submission using ref (survives async gaps)
      if (submittingRef.current) return;
      submittingRef.current = true;

      setLoading(true);
      setError(null);
      setActiveAnalyzeRun(null);

      try {
        const res = await fetch(`${API_BASE}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        });

        if (!res.ok) {
          throw new Error(`Analyze request failed: ${res.status}`);
        }

        const data = await res.json();
        bootstrapPolling.startPolling(data.runId);
      } catch (err) {
        setLoading(false);
        submittingRef.current = false;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError(error);
      }
    },
    [bootstrapPolling, onError]
  );

  // Derived disabled state — single source of truth for button
  const isDisabled = loading || transitioning || Boolean(activeAnalyzeRun);

  return {
    loading,
    transitioning,
    error,
    activeAnalyzeRun,
    startAnalyze,
    isDisabled,
  };
}
