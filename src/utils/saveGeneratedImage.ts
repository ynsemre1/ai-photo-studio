import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const LOCAL_DIR = FileSystem.documentDirectory + "generated/";

const getStorageKey = async (uid: string) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    uid
  );
  return `recentGeneratedImages_${hash.substring(0, 12)}`;
};

export const saveGeneratedImage = async (url: string, uid: string) => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true });
      console.log("path created:", LOCAL_DIR);
    }

    const filename = `img_${Date.now()}.png`;
    const localPath = LOCAL_DIR + filename;

    const download = await FileSystem.downloadAsync(url, localPath);
    console.log("photo download and cached", download.uri);

    const storageKey = await getStorageKey(uid);
    const json = await AsyncStorage.getItem(storageKey);
    const oldList = json ? JSON.parse(json) : [];

    const newList = [download.uri, ...oldList].slice(0, 10);
    await AsyncStorage.setItem(storageKey, JSON.stringify(newList));

    console.log("async stroage updated", storageKey);
    return download.uri;
  } catch (err) {
    console.log("photo save error", err);
    return null;
  }
};

export const getRecentGeneratedImages = async (uid: string): Promise<string[]> => {
  const storageKey = await getStorageKey(uid);
  const json = await AsyncStorage.getItem(storageKey);
  const list = json ? JSON.parse(json) : [];
  console.log("getRecentGeneratedImages:", storageKey, list.length, "adet");
  return list;
};
