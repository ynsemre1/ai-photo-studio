import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoriteContextType = {
  favorites: string[];
  toggleFavorite: (value: string) => void;
  isFavorite: (value: string) => boolean;
};

const FavoriteContext = createContext<FavoriteContextType | null>(null);
export const useFavorites = () => useContext(FavoriteContext)!;

export const FavoriteProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("favorites");
      if (json) setFavorites(JSON.parse(json));
    })();
  }, []);

  const saveFavorites = async (updated: string[]) => {
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  const toggleFavorite = (value: string) => {
    const updated = favorites.includes(value)
      ? favorites.filter((v) => v !== value)
      : [...favorites, value];
    saveFavorites(updated);
  };

  const isFavorite = (value: string) => favorites.includes(value);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};