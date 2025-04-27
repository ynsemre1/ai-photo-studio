import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db, storage } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";

type StyleItem = { filename: string; value: string; uri: string };
type StyleData = {
  style: StyleItem[];
  car: StyleItem[];
  professional: StyleItem[];
};

const StyleContext = createContext<StyleData | null>(null);
export const useStyleData = () => useContext(StyleContext);

export const StyleDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<StyleData>({
    style: [],
    car: [],
    professional: [],
  });

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const unsubscribeFns: Array<() => void> = [];

    const types = ["style", "car", "professional"] as const;

    types.forEach((type) => {
      const refCol = collection(db, type);

      const unsubscribe = onSnapshot(refCol, async (snap) => {
        console.log("🔥 Firestore değişikliği tespit edildi:", type);

        const enrichedData = await Promise.all(
          snap.docs.map(async (doc) => {
            const data = doc.data();
            const path = `styles/${type}/${data.filename}`;
            try {
              const uri = await getDownloadURL(ref(storage, path));
              return { ...data, uri } as StyleItem;
            } catch (err) {
              console.log("🚫 URI alınamadı:", path);
              return null;
            }
          })
        );

        setData((prev) => ({
          ...prev,
          [type]: enrichedData.filter(Boolean) as StyleItem[],
        }));

        const newCache = {
          ...data,
          [type]: enrichedData.filter(Boolean),
        };
        await AsyncStorage.setItem("styleData", JSON.stringify(newCache));
      });

      unsubscribeFns.push(unsubscribe);
    });

    return () => {
      unsubscribeFns.forEach((unsub) => unsub());
    };
  }, []);

  return <StyleContext.Provider value={data}>{children}</StyleContext.Provider>;
};