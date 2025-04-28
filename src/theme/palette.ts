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
  
  // 🟣 Dodger‑blue scale converted from OKLCH → HEX
  // 50/100/200 tweaked for subtle tints instead of pure white.
  const primaryScale: ColorScale = {
    DEFAULT: "#3B82F6", // ✨ central brand tone (≈500 in Tailwind scale)
    50:  "#FDFDFF",
    100: "#F6F8FF",
    200: "#E4EDFE",
    300: "#D7E6FD",
    400: "#B0CDFB",
    500: "#89B4FA",
    600: "#629BF8",
    700: "#3B82F6",
    800: "#0B61EE",
    900: "#084BB8",
    950: "#07409E",
  };
  
  export const lightTheme: ColorPalette = {
    primary: primaryScale,
    error:   { DEFAULT: "#FF3B30" }, // iOS red
    success: { DEFAULT: "#34C759" }, // iOS green
    bg:      { DEFAULT: "#FFFFFF" },
    surface: { 100: "#F7F7FA" },
    text:    { primary: "#111827", secondary: "#52525B", inverse: "#FFFFFF" },
  };
  
  // Dark‑theme overrides — lighter blues for better contrast.
  const primaryDark: ColorScale = {
    ...primaryScale,
    DEFAULT: "#89B4FA", // one step lighter than light DEFAULT
    400: "#A5C2F9",
    500: "#89B4FA",
    600: "#629BF8",
    700: "#3B82F6",
    800: "#0B61EE",
  };
  
  export const darkTheme: ColorPalette = {
    primary: primaryDark,
    error:   { DEFAULT: "#FF453A" }, // iOS dark‑mode red
    success: { DEFAULT: "#32D74B" }, // iOS dark‑mode green
    bg:      { DEFAULT: "#0D0D11" },
    surface: { 100: "#1A1A22" },
    text:    { primary: "#E6E6EB", secondary: "#A1A1AA", inverse: "#0D0D11" },
  };
  
  /**
   * Type‑safe helper: get a color via explicit group & shade
   *
   * Example: `getColor(theme, 'primary', 600)`
   */
  export const getColor = <G extends keyof ColorPalette, S extends keyof ColorPalette[G]>(
    palette: ColorPalette,
    group: G,
    shade: S,
  ): string => palette[group][shade] as unknown as string;
  