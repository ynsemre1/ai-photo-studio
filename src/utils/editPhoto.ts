import { storage, functions } from "../firebase/config";
import { ref, uploadBytes } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { saveGeneratedImage } from "../utils/saveGeneratedImage"; // 🔥 ekledik

/**
 * @param file    raw image picked from gallery / camera (Blob)
 * @param prompt  prompt string for OpenAI edit
 * @param uid     user's Firebase UID
 * @returns       local saved URI
 */
export async function editPhoto(
  file: Blob,
  prompt: string,
  uid: string = "anon"
): Promise<string | null> {
  const ts = Date.now();
  const path = `uploads/${uid}/${ts}.png`;
  const photoRef = ref(storage, path);

  await uploadBytes(photoRef, file, { contentType: "image/png" });

  const editFn = httpsCallable(functions, "edit_image");
  const response = await editFn({ filePath: path, prompt });

  const { generatedUrl } = response.data as { generatedUrl: string };

  const localUri = await saveGeneratedImage(generatedUrl);

  return localUri;
}
