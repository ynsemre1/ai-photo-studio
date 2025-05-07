import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, onSnapshot } from "firebase/firestore";
import { db, storage, auth } from "../firebase/config";
import { getDownloadURL, ref as storageRef } from "firebase/storage";

type StyleItem = {
  value: string;
  uri: string;
  gender?: "male" | "female";
};

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

  // Load cached data on first mount
  useEffect(() => {
    const loadCache = async () => {
      const cached = await AsyncStorage.getItem("styleData");
      if (cached) {
        setData(JSON.parse(cached));
      }
    };
    loadCache();
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribeFns: Array<() => void> = [];
    const types = ["style", "car", "professional"] as const;

    types.forEach((type) => {
      const refCol = collection(db, type);

      const unsubscribe = onSnapshot(refCol, async (snap) => {
        console.log("🔥 Firestore update detected for:", type);

        const enrichedData = await Promise.all(
          snap.docs.map(async (doc) => {
            const docData = doc.data();
            const fileName = docData.file_name;

            if (!fileName || !docData.value) return null;

            // Gender-aware image path handling
            if (docData.gender === true) {
              try {
                const malePath = `styles/${type}/male/${fileName}`;
                const femalePath = `styles/${type}/female/${fileName}`;

                const [maleUri, femaleUri] = await Promise.all([
                  getDownloadURL(storageRef(storage, malePath)),
                  getDownloadURL(storageRef(storage, femalePath)),
                ]);

                return [
                  { value: docData.value, uri: maleUri, gender: "male" },
                  { value: docData.value, uri: femaleUri, gender: "female" },
                ];
              } catch (err) {
                console.log("🚫 Gendered URI fetch failed:", fileName);
                return null;
              }
            }

            // Non-gendered classic fetch
            try {
              const path = `styles/${type}/${fileName}`;
              const uri = await getDownloadURL(storageRef(storage, path));
              return { value: docData.value, uri };
            } catch (err) {
              console.log("🚫 URI fetch failed:", fileName);
              return null;
            }
          })
        );

        const flattened = enrichedData.flat().filter(Boolean) as StyleItem[];

        setData((prev) => ({
          ...prev,
          [type]: flattened,
        }));

        const newCache = {
          ...data,
          [type]: flattened,
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