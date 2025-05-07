// src/theme/palette.ts

/**
 * Central design‑token file — the single source of truth for colors.
 * Only this file should contain raw HEX literals.
 *
 * Tip: keep the number of scales minimal; add new tokens *only* when a
 * semantic need appears (e.g. `warning`, `info`, `neutral`).
 */

/**
 * 12‑step scale similar to Tailwind.
 */
export interface ColorScale {
  DEFAULT: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface ColorPalette {
  primary: ColorScale
  error: { DEFAULT: string }
  success: { DEFAULT: string }
  warning: { DEFAULT: string }
  info: { DEFAULT: string }
  bg: { DEFAULT: string }
  surface: { 100: string; 200: string }
  text: { primary: string; secondary: string; inverse: string; accent: string }
}

const primaryScale: ColorScale = {
  DEFAULT: "#4F46E5", // More vibrant indigo as primary color
  50: "#EEF2FF",
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",
  600: "#4F46E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81",
  950: "#1E1B4B",
}

export const lightTheme: ColorPalette = {
  primary: primaryScale,
  error: { DEFAULT: "#EF4444" }, // Brighter red for errors
  success: { DEFAULT: "#10B981" }, // Emerald green for success
  warning: { DEFAULT: "#F59E0B" }, // Amber for warnings
  info: { DEFAULT: "#3B82F6" }, // Blue for information
  bg: { DEFAULT: "#F8FAFC" }, // Lighter background
  surface: {
    100: "#FFFFFF", // Pure white surface
    200: "#F1F5F9", // Light gray surface
  },
  text: {
    primary: "#1E293B", // Slate-800 for better readability
    secondary: "#64748B", // Slate-500 for secondary text
    inverse: "#FFFFFF", // White for text on dark backgrounds
    accent: "#4F46E5", // Primary color for accented text
  },
}

const primaryDark: ColorScale = {
  ...primaryScale,
  DEFAULT: "#7FE0FB",
  400: "#5FD6F7",
  500: "#3FC1F2",
  600: "#30A5D6",
  700: "#2188B9",
  800: "#146C9C",
}

export const darkTheme: ColorPalette = {
  primary: primaryDark,
  error: { DEFAULT: "#FF6B6F" },
  success: { DEFAULT: "#00E08A" },
  warning: { DEFAULT: "#FBBF24" }, // Amber for warnings
  info: { DEFAULT: "#60A5FA" }, // Blue for information
  bg: { DEFAULT: "#0A0A12" },
  surface: {
    100: "#18181F",
    200: "#1E1E2A",
  },
  text: {
    primary: "#E2E8F0",
    secondary: "#94A3B8",
    inverse: "#0A0A12",
    accent: "#7FE0FB",
  },
}

export const getColor = <G extends keyof ColorPalette, S extends keyof ColorPalette[G]>(
  palette: ColorPalette,
  group: G,
  shade: S,
): string => palette[group][shade] as unknown as string
