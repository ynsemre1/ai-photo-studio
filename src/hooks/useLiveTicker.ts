import { useEffect, useRef, useState, useCallback } from "react";

type TickerData = {
  symbol: string;
  price: string;
  change24h: string;
};

type TickerStatus = "idle" | "connecting" | "connected" | "failed";

type UseLiveTickerReturn = {
  data: TickerData | null;
  status: TickerStatus;
  retry: () => void;
};

const MAX_ATTEMPTS = 5;
const MAX_BACKOFF_MS = 30_000;
const RECOVERY_INTERVAL_MS = 60_000;

export function useLiveTicker(symbol: string): UseLiveTickerReturn {
  const [data, setData] = useState<TickerData | null>(null);
  const [status, setStatus] = useState<TickerStatus>("idle");
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const wsRef = useRef<WebSocket>();
  const closedByCleanupRef = useRef(false);

  const connect = useCallback(() => {
    closedByCleanupRef.current = false;
    setStatus("connecting");

    const streamName = `${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setData({
          symbol: msg.s,
          price: msg.c,
          change24h: msg.P,
        });
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      if (closedByCleanupRef.current) return;

      const attempt = reconnectAttemptRef.current;
      if (attempt >= MAX_ATTEMPTS) {
        setStatus("failed");
        return;
      }

      setStatus("connecting");
      const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
      reconnectTimerRef.current = setTimeout(() => {
        reconnectAttemptRef.current += 1;
        connect();
      }, delay);
    };
  }, [symbol]);

  const retry = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
    closedByCleanupRef.current = true;
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect]);

  // Visibility-based recovery: when tab becomes visible and status is "failed",
  // reset attempts and reconnect automatically.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "failed") {
        retry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, retry]);

  // Long-interval recovery: when status is "failed", periodically attempt
  // to reconnect so background tabs can eventually recover too.
  useEffect(() => {
    if (status !== "failed") return;

    const timer = setTimeout(() => {
      retry();
    }, RECOVERY_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [status, retry]);

  useEffect(() => {
    connect();

    return () => {
      closedByCleanupRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { data, status, retry };
}
