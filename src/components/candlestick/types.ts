import type { ISeriesApi, SeriesType } from "lightweight-charts";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OverlayLine {
  label: string;
  price: number;
  color: string;
  lineStyle?: number; // LineStyle enum from lightweight-charts
}

export interface OverlayConfig {
  support?: number;
  resistance?: number;
  entry?: number;
  takeProfit?: number;
  stopLoss?: number;
}

export interface CandlestickChartProps {
  candles: CandleData[];
  isLoading: boolean;
  errorMessage: string | null;
  asOfUnix?: number;
  overlayConfig?: OverlayConfig;
  height?: number;
}

export type LineSeriesRef = ISeriesApi<"Line">;
