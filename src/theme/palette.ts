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
  DEFAULT: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorPalette {
  primary: ColorScale;
  error: { DEFAULT: string };
  success: { DEFAULT: string };
  bg: { DEFAULT: string };
  surface: { 100: string };
  text: { primary: string; secondary: string; inverse: string };
}

const primaryScale: ColorScale = {
  DEFAULT: "#3FC1F2",
  50:  "#F2FCFF",
  100: "#D6F7FF",
  200: "#ADEEFF",
  300: "#7FE0FB",
  400: "#50D3F7",
  500: "#3FC1F2",
  600: "#30A5D6",
  700: "#2188B9",
  800: "#146C9C",
  900: "#0B567D",
  950: "#063F5E",
};

export const lightTheme: ColorPalette = {
  primary: primaryScale,
  error: { DEFAULT: "#FF5A5F" }, 
  success: { DEFAULT: "#00D26A" }, 
  bg: { DEFAULT: "#F0FAFF" },
  surface: { 100: "#F9FBFD" }, 
  text: {
    primary: "#0F172A", 
    secondary: "#64748B",
    inverse: "#FFFFFF",
  },
};

const primaryDark: ColorScale = {
  ...primaryScale,
  DEFAULT: "#7FE0FB",
  400: "#5FD6F7",
  500: "#3FC1F2",
  600: "#30A5D6",
  700: "#2188B9",
  800: "#146C9C",
};

export const darkTheme: ColorPalette = {
  primary: primaryDark,
  error: { DEFAULT: "#FF6B6F" },
  success: { DEFAULT: "#00E08A" },
  bg: { DEFAULT: "#0A0A12" },
  surface: { 100: "#18181F" },
  text: {
    primary: "#E2E8F0",
    secondary: "#94A3B8",
    inverse: "#0A0A12",
  },
};

export const getColor = <G extends keyof ColorPalette, S extends keyof ColorPalette[G]>(
  palette: ColorPalette,
  group: G,
  shade: S,
): string => palette[group][shade] as unknown as string;
  