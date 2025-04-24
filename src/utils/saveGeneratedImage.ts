import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "recentGeneratedImages";
const LOCAL_DIR = FileSystem.documentDirectory + "generated/";

export const saveGeneratedImage = async (url: string) => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, { intermediates: true });
    }

    const filename = `img_${Date.now()}.png`;
    const localPath = LOCAL_DIR + filename;

    const download = await FileSystem.downloadAsync(url, localPath);

    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const oldList = json ? JSON.parse(json) : [];

    const newList = [download.uri, ...oldList].slice(0, 10);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));

    return download.uri;
  } catch (err) {
    return null;
  }
};

export const getRecentGeneratedImages = async (): Promise<string[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};