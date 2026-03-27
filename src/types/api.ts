export interface DataFreshness {
  data_freshness_status: "fresh" | "stale" | "unknown";
  staleness_minutes: number;
  max_compute_lag_seconds: number;
  stale_threshold_seconds: number;
  candles_staleness_seconds: number;
}

export interface AnalyzeResponse {
  id: string;
  created_at: string;
  as_of: string;
  status: string;
  result: Record<string, unknown>;
  data_freshness: DataFreshness;
}
