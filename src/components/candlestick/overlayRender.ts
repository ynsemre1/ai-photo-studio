import type { IChartApi, ISeriesApi, LineStyle } from "lightweight-charts";
import type { OverlayConfig, OverlayLine } from "./types";

const OVERLAY_COLORS: Record<string, string> = {
  support: "#2962FF",
  resistance: "#FF6D00",
  entry: "#00E676",
  takeProfit: "#76FF03",
  stopLoss: "#FF1744",
  asOf: "#FFFFFF",
};

const OVERLAY_LINE_STYLES: Record<string, number> = {
  support: 2, // LineStyle.Dashed
  resistance: 2,
  entry: 0, // LineStyle.Solid
  takeProfit: 3, // LineStyle.LargeDashed
  stopLoss: 3,
  asOf: 1, // LineStyle.Dotted
};

export function buildOverlayLines(config: OverlayConfig): OverlayLine[] {
  const lines: OverlayLine[] = [];

  if (config.support != null) {
    lines.push({
      label: "Support",
      price: config.support,
      color: OVERLAY_COLORS.support,
      lineStyle: OVERLAY_LINE_STYLES.support,
    });
  }
  if (config.resistance != null) {
    lines.push({
      label: "Resistance",
      price: config.resistance,
      color: OVERLAY_COLORS.resistance,
      lineStyle: OVERLAY_LINE_STYLES.resistance,
    });
  }
  if (config.entry != null) {
    lines.push({
      label: "Entry",
      price: config.entry,
      color: OVERLAY_COLORS.entry,
      lineStyle: OVERLAY_LINE_STYLES.entry,
    });
  }
  if (config.takeProfit != null) {
    lines.push({
      label: "TP",
      price: config.takeProfit,
      color: OVERLAY_COLORS.takeProfit,
      lineStyle: OVERLAY_LINE_STYLES.takeProfit,
    });
  }
  if (config.stopLoss != null) {
    lines.push({
      label: "SL",
      price: config.stopLoss,
      color: OVERLAY_COLORS.stopLoss,
      lineStyle: OVERLAY_LINE_STYLES.stopLoss,
    });
  }

  return lines;
}

export function syncOverlayLines(
  chart: IChartApi,
  existingLines: ISeriesApi<"Line">[],
  overlayLines: OverlayLine[]
): ISeriesApi<"Line">[] {
  // Remove old overlay line series
  for (const series of existingLines) {
    chart.removeSeries(series);
  }

  // Create new overlay line series with price lines
  const newSeries: ISeriesApi<"Line">[] = [];

  for (const overlay of overlayLines) {
    const lineSeries = chart.addLineSeries({
      color: "transparent",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    lineSeries.createPriceLine({
      price: overlay.price,
      color: overlay.color,
      lineWidth: 1,
      lineStyle: (overlay.lineStyle ?? 0) as LineStyle,
      axisLabelVisible: true,
      title: overlay.label,
    });

    // Set empty data — price line doesn't need series data
    lineSeries.setData([]);
    newSeries.push(lineSeries);
  }

  return newSeries;
}

export function syncAsOfLine(
  chart: IChartApi,
  existingMarkerSeries: ISeriesApi<"Line"> | null,
  asOfUnix: number | undefined,
  priceRange: { min: number; max: number } | null
): ISeriesApi<"Line"> | null {
  // Remove old as-of line
  if (existingMarkerSeries) {
    chart.removeSeries(existingMarkerSeries);
  }

  if (asOfUnix == null || priceRange == null) {
    return null;
  }

  const asOfSeries = chart.addLineSeries({
    color: OVERLAY_COLORS.asOf,
    lineWidth: 1,
    lineStyle: OVERLAY_LINE_STYLES.asOf as LineStyle,
    lastValueVisible: false,
    priceLineVisible: false,
    crosshairMarkerVisible: false,
  });

  // Vertical line approximated as two points at price extremes
  asOfSeries.setData([
    { time: asOfUnix as any, value: priceRange.min },
    { time: asOfUnix as any, value: priceRange.max },
  ]);

  return asOfSeries;
}

export function computePriceRange(
  candles: { high: number; low: number }[]
): { min: number; max: number } | null {
  if (candles.length === 0) return null;

  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  return { min, max };
}
