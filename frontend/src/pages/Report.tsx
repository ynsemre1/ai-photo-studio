import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import type { AnalyzeResponse } from "../types/analyze";
import { getRunIdFromAnalyzeResponse } from "../utils/analyze";
import { fetchRunById } from "../api/runs";

// --- Types ---

interface SavedReportSnapshot {
  runId: string;
  run: AnalyzeResponse;
}

interface RouteState {
  run?: AnalyzeResponse;
  runId?: string;
}

// --- Constants ---

const REPORT_SNAPSHOT_KEY = "report_last_snapshot_v1";

// --- Helpers ---

function readSnapshot(): SavedReportSnapshot | null {
  try {
    const raw = localStorage.getItem(REPORT_SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedReportSnapshot;
  } catch {
    return null;
  }
}

function saveSnapshot(run: AnalyzeResponse): void {
  try {
    const snapshot: SavedReportSnapshot = {
      runId: getRunIdFromAnalyzeResponse(run),
      run,
    };
    localStorage.setItem(REPORT_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota exceeded — snapshot is best-effort, ignore silently
  }
}

// --- Component ---

export default function Report() {
  const location = useLocation();
  const routeState = (location.state ?? {}) as RouteState;

  const [run, setRun] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function restoreRun() {
      // 1) Route state (navigated from analyze page)
      if (routeState.run) {
        setRun(routeState.run);
        saveSnapshot(routeState.run);
        setLoading(false);
        return;
      }

      // 2) Fetch by runId from route state
      if (routeState.runId) {
        try {
          const fetchedRun = await fetchRunById(routeState.runId);
          setRun(fetchedRun);
          saveSnapshot(fetchedRun);
        } catch (err) {
          setError("Failed to load report.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // 3) Fallback: read from localStorage snapshot
      const snapshot = readSnapshot();
      if (snapshot) {
        setRun(snapshot.run);
        setLoading(false);
        return;
      }

      setError("No report data available.");
      setLoading(false);
    }

    restoreRun();
  }, [routeState.run, routeState.runId]);

  if (loading) return <div>Loading report...</div>;
  if (error) return <div>{error}</div>;
  if (!run) return <div>No report data.</div>;

  return (
    <div>
      <h1>Report</h1>
      <pre>{JSON.stringify(run, null, 2)}</pre>
    </div>
  );
}
