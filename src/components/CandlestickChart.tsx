"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import type { CandlestickChartProps } from "./candlestick/types";

let createChart: typeof import("lightweight-charts").createChart | undefined;
let ColorType: typeof import("lightweight-charts").ColorType | undefined;

// lightweight-charts is web-only; guard the import for native platforms
if (Platform.OS === "web") {
  try {
    const lc = require("lightweight-charts");
    createChart = lc.createChart;
    ColorType = lc.ColorType;
  } catch {
    // lightweight-charts not installed — component will render fallback
  }
}

type IChartApi = import("lightweight-charts").IChartApi;
type ISeriesApi<T extends import("lightweight-charts").SeriesType> =
  import("lightweight-charts").ISeriesApi<T>;

export default function CandlestickChart({
  candles,
  isLoading,
  errorMessage,
  asOfUnix,
  overlayConfig,
  height = 400,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const overlayLinesRef = useRef<ISeriesApi<"Line">[]>([]);
  const asOfSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // ──────────────────────────────────────────────
  // Effect 1: Chart creation (mount) & destruction (unmount)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== "web" || !createChart || !ColorType || !containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#131722" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "#2B2B43" },
      timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderDownColor: "#ef5350",
      borderUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      wickUpColor: "#26a69a",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // ResizeObserver for responsive sizing
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          chart.applyOptions({ width });
        }
      }
    });
    observer.observe(containerRef.current);
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
      overlayLinesRef.current = [];
      asOfSeriesRef.current = null;
      candleSeriesRef.current = null;
      chart.remove();
      chartRef.current = null;
    };
    // height is intentionally excluded — changing height after mount
    // would require chart recreation which this refactor avoids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ──────────────────────────────────────────────
  // Effect 2: Candle data update (no chart recreation)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // Fit content after data load
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // ──────────────────────────────────────────────
  // Effect 3: Overlay lines (support/resistance/entry/TP/SL)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !overlayConfig) return;

    // Lazy-import overlay utils to keep main bundle lighter
    import("./candlestick/overlayRender").then(
      ({ buildOverlayLines, syncOverlayLines }) => {
        const lines = buildOverlayLines(overlayConfig);
        overlayLinesRef.current = syncOverlayLines(
          chart,
          overlayLinesRef.current,
          lines
        );
      }
    );
  }, [overlayConfig]);

  // ──────────────────────────────────────────────
  // Effect 4: As-of vertical line
  // ──────────────────────────────────────────────
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    import("./candlestick/overlayRender").then(
      ({ syncAsOfLine, computePriceRange }) => {
        const priceRange = computePriceRange(candles);
        asOfSeriesRef.current = syncAsOfLine(
          chart,
          asOfSeriesRef.current,
          asOfUnix,
          priceRange
        );
      }
    );
  }, [asOfUnix, candles]);

  // ──────────────────────────────────────────────
  // Effect 5: Visibility toggle (no destroy/recreate)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const shouldHide = isLoading || !!errorMessage;
    containerRef.current.style.visibility = shouldHide ? "hidden" : "visible";
  }, [isLoading, errorMessage]);

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  if (Platform.OS !== "web") {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.fallbackText}>
          Candlestick chart is only available on web.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#26a69a" />
        </View>
      )}

      {errorMessage && !isLoading && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <div
        ref={containerRef as any}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    backgroundColor: "#131722",
    borderRadius: 8,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(19, 23, 34, 0.85)",
    zIndex: 1,
  },
  errorText: {
    color: "#ef5350",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  fallbackText: {
    color: "#d1d4dc",
    fontSize: 14,
    textAlign: "center",
  },
});
