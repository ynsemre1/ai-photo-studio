import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

const LOCAL_DIR = FileSystem.documentDirectory + "generated/";

const getStorageKey = async (uid: string) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    uid
  );
  return `recentGeneratedImages_${hash.substring(0, 12)}`;
};

export const syncGeneratedImagesFromStorage = async (uid: string) => {
  try {
    const storageKey = await getStorageKey(uid);
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true });
    }

    const imagesRef = ref(storage, `generatedImages/${uid}`);
    const result = await listAll(imagesRef);

    const downloadPromises = result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      const filename = `img_${item.name}`;
      const localPath = LOCAL_DIR + filename;

      const fileExists = await FileSystem.getInfoAsync(localPath);
      if (!fileExists.exists) {
        await FileSystem.downloadAsync(url, localPath);
      } else {
      }

      return localPath;
    });

    const localUris = await Promise.all(downloadPromises);

    await AsyncStorage.setItem(storageKey, JSON.stringify(localUris));

    return localUris;
  } catch (err) {
    return [];
  }
};

// Yeni üretilen bir fotoğrafı local'e kaydeder
export const saveGeneratedImage = async (url: string, uid: string) => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true });
    }

    const filename = `img_${Date.now()}.png`;
    const localPath = LOCAL_DIR + filename;

    const download = await FileSystem.downloadAsync(url, localPath);

    const storageKey = await getStorageKey(uid);
    const json = await AsyncStorage.getItem(storageKey);
    const oldList = json ? JSON.parse(json) : [];

    const newList = [download.uri, ...oldList];
    await AsyncStorage.setItem(storageKey, JSON.stringify(newList));

    return download.uri;
  } catch (err) {
    return null;
  }
};

// Local'den en güncel fotoğraf listesini getirir
export const getRecentGeneratedImages = async (uid: string): Promise<string[]> => {
  const storageKey = await getStorageKey(uid);
  const json = await AsyncStorage.getItem(storageKey);
  const list = json ? JSON.parse(json) : [];
  return list;
};