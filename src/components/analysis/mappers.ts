import { AnalyzeResponse, DataFreshness } from "../../types/api";

export interface AnalysisViewModel {
  id: string;
  createdAt: string;
  asOf: string;
  status: string;
  result: Record<string, unknown>;
  dataFreshness: DataFreshness;
}

export function mapAnalyzeResponseToViewModel(
  response: AnalyzeResponse
): AnalysisViewModel {
  return {
    id: response.id,
    createdAt: response.created_at,
    asOf: response.as_of,
    status: response.status,
    result: response.result,
    dataFreshness: response.data_freshness,
  };
}
