import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { collection, getDocs, query } from "firebase/firestore";
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

const CACHE_KEY = "styleData";
const LAST_SYNC_KEY = "lastSync";
const SYNC_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours

export const StyleDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<StyleData>({
    style: [],
    car: [],
    professional: [],
  });

  useEffect(() => {
    const loadCache = async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setData(JSON.parse(cached));
    };

    const syncData = async () => {
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      const now = Date.now();

      if (lastSync && now - Number(lastSync) < SYNC_INTERVAL) {
        return;
      }

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const types = ["style", "car", "professional"] as const;
      const updatedCache: StyleData = { style: [], car: [], professional: [] };

      for (const type of types) {
        const refCol = collection(db, type);
        const snap = await getDocs(query(refCol));

        if (!snap.empty) {
          for (const doc of snap.docs) {
            const docData = doc.data();
            const fileName = docData.file_name;
            const isGendered = docData.gender === true;

            if (!fileName || !docData.value) continue;

            try {
              if (isGendered) {
                const maleUri = await getOrDownloadImage(`styles/${type}/male/${fileName}`, "male");
                const femaleUri = await getOrDownloadImage(`styles/${type}/female/${fileName}`, "female");

                const maleItem = { value: docData.value, uri: maleUri, gender: "male" as const};
                const femaleItem = { value: docData.value, uri: femaleUri, gender: "female" as const};

                updatedCache[type].push(maleItem, femaleItem);

                // update UI incrementally
                setData((prev) => ({
                  ...prev,
                  [type]: [...prev[type], maleItem, femaleItem],
                }));
              } else {
                const uri = await getOrDownloadImage(`styles/${type}/${fileName}`);
                const item = { value: docData.value, uri };

                updatedCache[type].push(item);

                // update UI incrementally
                setData((prev) => ({
                  ...prev,
                  [type]: [...prev[type], item],
                }));
              }
            } catch (e) {
              console.log("❌ Image download error:", e);
              continue;
            }
          }
        }
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
      await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
    };

    const getOrDownloadImage = async (storagePath: string, gender?: "male" | "female") => {
      const fileName = storagePath.split("/").pop();
      const genderPrefix = gender ? `${gender}_` : "";
      const localPath = `${FileSystem.cacheDirectory}${genderPrefix}${fileName}`;

      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        const remoteUri = await getDownloadURL(storageRef(storage, storagePath));
        await FileSystem.downloadAsync(remoteUri, localPath);
      }

      return localPath;
    };

    loadCache().then(syncData);
  }, []);

  return <StyleContext.Provider value={data}>{children}</StyleContext.Provider>;
};