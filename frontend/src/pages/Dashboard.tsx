import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalyzeRunPolling } from "../hooks/useAnalyzeRunPolling";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface AnalyzeRun {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  reportUrl?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// AuthenticatedDashboard
// ---------------------------------------------------------------------------

interface AuthenticatedDashboardProps {
  refreshHistory: () => void;
}

export function AuthenticatedDashboard({
  refreshHistory,
}: AuthenticatedDashboardProps) {
  const { t } = useTranslation();
  const [activeRun, setActiveRun] = useState<AnalyzeRun | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const onSettled = useCallback(() => {
    refreshHistory();
  }, [refreshHistory]);

  const { activeAnalyzeRun, startAnalyzeRunPolling } = useAnalyzeRunPolling({
    failedMessage: t("dashboard.analyzeFailed"),
    timeoutMessage: t("dashboard.analyzeTimeout"),
    onReport: (data) => {
      refreshHistory();
      setActiveRun(data);
    },
    onError: setDashboardError,
    onSettled,
  });

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      {dashboardError && <p className="error">{dashboardError}</p>}
      {activeAnalyzeRun && <p>{t("dashboard.analyzing")}</p>}
      {activeRun && <p>{t("dashboard.reportReady")}</p>}
      <button
        onClick={() =>
          startAnalyzeRunPolling({ id: "new", status: "pending" })
        }
      >
        {t("dashboard.startAnalysis")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GuestDashboard
// ---------------------------------------------------------------------------

export function GuestDashboard() {
  const { t } = useTranslation();
  const [activeRun, setActiveRun] = useState<AnalyzeRun | null>(null);

  const { activeAnalyzeRun, startAnalyzeRunPolling } = useAnalyzeRunPolling({
    failedMessage: t("dashboard.analyzeFailed"),
    timeoutMessage: t("dashboard.analyzeTimeout"),
    onReport: (data) => setActiveRun(data),
    onError: () => undefined,
  });

  return (
    <div>
      <h1>{t("dashboard.guestTitle")}</h1>
      {activeAnalyzeRun && <p>{t("dashboard.analyzing")}</p>}
      {activeRun && <p>{t("dashboard.reportReady")}</p>}
      <button
        onClick={() =>
          startAnalyzeRunPolling({ id: "guest", status: "pending" })
        }
      >
        {t("dashboard.startAnalysis")}
      </button>
    </div>
  );
}
