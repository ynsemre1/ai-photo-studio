export interface AnalyzeReport {
  id: string;
  status: "completed" | "queued" | "processing";
  result?: Record<string, unknown>;
  createdAt: string;
}

export interface BootstrapResponse {
  kind: "report" | "queued" | "processing";
  data?: AnalyzeReport;
  runId?: string;
}

export interface AnalyzeRunStatus {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  report?: AnalyzeReport;
}
