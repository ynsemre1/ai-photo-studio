import { useState, useCallback } from "react";
import {
  postAnalyze,
  type AnalyzeRequest,
  type AnalyzeResponse,
  ApiError,
} from "../../api/client";

interface GuestAnalyzeState {
  loading: boolean;
  result: AnalyzeResponse | null;
  error: string | null;
  limitReached: boolean;
}

export function useGuestAnalyze() {
  const [state, setState] = useState<GuestAnalyzeState>({
    loading: false,
    result: null,
    error: null,
    limitReached: false,
  });

  const analyze = useCallback(async (req: AnalyzeRequest) => {
    setState({ loading: true, result: null, error: null, limitReached: false });
    try {
      const result = await postAnalyze(req);

      if (result.kind === "guest_limit") {
        setState({
          loading: false,
          result,
          error: null,
          limitReached: true,
        });
        return result;
      }

      setState({ loading: false, result, error: null, limitReached: false });
      return result;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred";
      setState({
        loading: false,
        result: null,
        error: message,
        limitReached: false,
      });
      return null;
    }
  }, []);

  return { ...state, analyze };
}
