import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { getAuth } from "firebase/auth";

type StyleItem = { filename: string; value: string };
type StyleData = {
  style: StyleItem[];
  car: StyleItem[];
  professional: StyleItem[];
};

const StyleContext = createContext<StyleData | null>(null);
export const useStyleData = () => useContext(StyleContext);

export const StyleDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<StyleData>({
    style: [],
    car: [],
    professional: [],
  });

  const fetchFromFirestore = async (): Promise<StyleData> => {
    const types = ["style", "car", "professional"] as const;
    const results: any = {};

    for (const type of types) {
      console.log("🔥 Fetching from Firestore:", type);
      const ref = collection(db, type);
      console.log("📁 Collection Ref:", ref.path);

      const snap = await getDocs(ref);
      console.log("✅ DOC COUNT:", snap.size);

      results[type] = snap.docs.map((doc) => doc.data()) as StyleItem[];
    }

    return results;
  };

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem("styleData");
        if (cached) {
          console.log("CACHE VAR");
          setData(JSON.parse(cached));
        } else {
          console.log("FIRESTORE'DAN ÇEKİYORUM");
          const fresh = await fetchFromFirestore();
          await AsyncStorage.setItem("styleData", JSON.stringify(fresh));
          setData(fresh);
        }
      } catch (err) {
        console.log("🔥 HATA:", err);
      }
    })();
  }, []);

  return <StyleContext.Provider value={data}>{children}</StyleContext.Provider>;
};
