import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
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

  const fetchFromFirestore = async (): Promise<StyleData> => {
    const types = ["style", "car", "professional"] as const;
    const results: Record<string, StyleItem[]> = {};

    for (const type of types) {
      console.log("🔥 Fetching from Firestore:", type);
      const refCol = collection(db, type);
      const snap = await getDocs(refCol);

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

      results[type] = enrichedData.filter(Boolean) as StyleItem[];
    }

    return results as StyleData;
  };

  useEffect(() => {
    (async () => {
      try {
        const uid = getAuth().currentUser?.uid;
        if (!uid) return;

        const cached = await AsyncStorage.getItem("styleData");
        if (cached) {
          console.log("CACHE VAR");
          setData(JSON.parse(cached));
        } else {
          console.log("FIRESTORE + STORAGE ÇEKİLİYOR...");
          const fresh = await fetchFromFirestore();
          await AsyncStorage.setItem("styleData", JSON.stringify(fresh));
          setData(fresh);
        }
      } catch (err) {
        console.log("🔥 CACHE/FIRESTORE/STORAGE HATASI:", err);
      }
    })();
  }, []);

  return <StyleContext.Provider value={data}>{children}</StyleContext.Provider>;
};
