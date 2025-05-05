import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, onSnapshot } from "firebase/firestore";
import { db, storage, auth } from "../firebase/config";
import { getDownloadURL, ref as storageRef } from "firebase/storage";

type StyleItem = { file_name: string; value: string; uri: string };
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
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribeFns: Array<() => void> = [];
    const types = ["style", "car", "professional"] as const;

    types.forEach((type) => {
      const refCol = collection(db, type);

      const unsubscribe = onSnapshot(refCol, async (snap) => {
        console.log("🔥 Firestore değişikliği tespit edildi:", type);

        const enrichedData = await Promise.all(
          snap.docs.map(async (doc) => {
            const docData = doc.data();
            const path = `styles/${type}/${docData.file_name}`;

            try {
              const uri = await getDownloadURL(storageRef(storage, path));
              return { ...docData, uri } as StyleItem;
            } catch (err) {
              console.log("🚫 URI alınamadı:", path);
              console.log("Hata Detayı:", JSON.stringify(err));
              return null;
            }
          })
        );

        const filtered = enrichedData.filter(Boolean) as StyleItem[];

        setData((prev) => ({
          ...prev,
          [type]: filtered,
        }));

        const newCache = {
          ...data,
          [type]: filtered,
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