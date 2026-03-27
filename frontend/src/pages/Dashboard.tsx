import React, { useState, useCallback } from "react";
import { useDashboardRun } from "../hooks/dashboard/useDashboardRun";
import type { AnalyzeReport } from "../types/analysis";

export default function Dashboard() {
  const [imageId, setImageId] = useState<string | null>(null);
  const [report, setReport] = useState<AnalyzeReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReport = useCallback((data: AnalyzeReport) => {
    setReport(data);
  }, []);

  const handleError = useCallback((err: Error) => {
    setErrorMessage(err.message);
  }, []);

  const {
    loading,
    transitioning,
    error,
    activeAnalyzeRun,
    startAnalyze,
    isDisabled,
  } = useDashboardRun({
    onReport: handleReport,
    onError: handleError,
  });

  const handleAnalyze = () => {
    if (!imageId) return;
    setReport(null);
    setErrorMessage(null);
    startAnalyze(imageId);
  };

  const getButtonLabel = (): string => {
    if (loading || transitioning) return "Analyzing...";
    if (activeAnalyzeRun) return "Processing...";
    return "Analyze Image";
  };

  return (
    <div className="dashboard">
      <h1>AI Photo Studio</h1>

      <section className="image-selection">
        <input
          type="text"
          placeholder="Enter image ID"
          value={imageId ?? ""}
          onChange={(e) => setImageId(e.target.value || null)}
          disabled={isDisabled}
        />
      </section>

      <section className="analyze-action">
        {/* Button disabled uses the derived isDisabled which covers:
            loading || transitioning || Boolean(activeAnalyzeRun)
            This prevents clicks during bootstrap -> analyze transition */}
        <button
          onClick={handleAnalyze}
          disabled={isDisabled || !imageId}
        >
          {getButtonLabel()}
        </button>
      </section>

      {errorMessage && (
        <section className="error">
          <p className="error-message">{errorMessage}</p>
        </section>
      )}

      {activeAnalyzeRun && (
        <section className="status">
          <p>Run ID: {activeAnalyzeRun.id}</p>
          <p>Status: {activeAnalyzeRun.status}</p>
        </section>
      )}

      {report && (
        <section className="report">
          <h2>Analysis Report</h2>
          <p>Report ID: {report.id}</p>
          <pre>{JSON.stringify(report.result, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}
