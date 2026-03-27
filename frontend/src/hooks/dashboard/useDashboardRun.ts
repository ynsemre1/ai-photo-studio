import { useState, useCallback } from "react";
import {
  postAnalyze,
  type AnalyzeRequest,
  type AnalyzeResponse,
  ApiError,
} from "../../api/client";

interface DashboardRunState {
  loading: boolean;
  result: AnalyzeResponse | null;
  error: string | null;
}

export function useDashboardRun() {
  const [state, setState] = useState<DashboardRunState>({
    loading: false,
    result: null,
    error: null,
  });

  const run = useCallback(async (req: AnalyzeRequest) => {
    setState({ loading: true, result: null, error: null });
    try {
      const result = await postAnalyze(req);
      setState({ loading: false, result, error: null });
      return result;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred";
      setState({ loading: false, result: null, error: message });
      return null;
    }
  }, []);

  return { ...state, run };
}
