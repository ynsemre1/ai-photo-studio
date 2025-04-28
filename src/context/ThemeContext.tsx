//src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { lightTheme, darkTheme, ColorPalette } from "../theme/palette";

type ThemeContextShape = {
  colors: ColorPalette;
  scheme: ColorSchemeName;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextShape>(null!);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const toggle = () => setScheme((prev) => (prev === "dark" ? "light" : "dark"));

  const colors = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, scheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);