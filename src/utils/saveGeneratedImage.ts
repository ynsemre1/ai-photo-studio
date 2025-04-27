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

// Kullanıcının Storage'daki tüm geçmiş fotoğraflarını çekip local'e kaydeder
export const syncGeneratedImagesFromStorage = async (uid: string) => {
  try {
    const storageKey = await getStorageKey(uid);
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true });
      console.log("Local klasör oluşturuldu:", LOCAL_DIR);
    }

    const imagesRef = ref(storage, `generatedImages/${uid}`);
    const result = await listAll(imagesRef);

    const downloadPromises = result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      const filename = `img_${item.name}`; // Dosya adını koruyoruz
      const localPath = LOCAL_DIR + filename;

      const fileExists = await FileSystem.getInfoAsync(localPath);
      if (!fileExists.exists) {
        await FileSystem.downloadAsync(url, localPath);
        console.log("İndirildi:", localPath);
      } else {
        console.log("Zaten var:", localPath);
      }

      return localPath;
    });

    const localUris = await Promise.all(downloadPromises);

    await AsyncStorage.setItem(storageKey, JSON.stringify(localUris));
    console.log("Firebase Storage'dan tüm fotoğraflar eşitlendi:", localUris.length);

    return localUris;
  } catch (err) {
    console.log("Firebase Storage eşitleme hatası:", err);
    return [];
  }
};

// Yeni üretilen bir fotoğrafı local'e kaydeder
export const saveGeneratedImage = async (url: string, uid: string) => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true });
      console.log("Local klasör oluşturuldu:", LOCAL_DIR);
    }

    const filename = `img_${Date.now()}.png`;
    const localPath = LOCAL_DIR + filename;

    const download = await FileSystem.downloadAsync(url, localPath);
    console.log("Yeni fotoğraf indirildi:", download.uri);

    const storageKey = await getStorageKey(uid);
    const json = await AsyncStorage.getItem(storageKey);
    const oldList = json ? JSON.parse(json) : [];

    const newList = [download.uri, ...oldList];
    await AsyncStorage.setItem(storageKey, JSON.stringify(newList));

    console.log("AsyncStorage güncellendi:", storageKey);
    return download.uri;
  } catch (err) {
    console.log("Fotoğraf kaydetme hatası:", err);
    return null;
  }
};

// Local'den en güncel fotoğraf listesini getirir
export const getRecentGeneratedImages = async (uid: string): Promise<string[]> => {
  const storageKey = await getStorageKey(uid);
  const json = await AsyncStorage.getItem(storageKey);
  const list = json ? JSON.parse(json) : [];
  console.log("🗂️ Local kayıtlı fotoğraf sayısı:", list.length);
  return list;
};