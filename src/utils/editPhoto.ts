import { storage, functions } from "../firebase/config";
import { ref, uploadBytes } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

/**
 * @param file    raw image picked from gallery / camera (Blob)
 * @param prompt  prompt string for OpenAI edit
 * @param uid     user's Firebase UID
 * @returns       signed URL of generated image
 */
export async function editPhoto(
  file: Blob,
  prompt: string,
  uid: string = "anon"
): Promise<string> {
  const ts = Date.now();
  const path = `uploads/${uid}/${ts}.png`;
  const photoRef = ref(storage, path);

  await uploadBytes(photoRef, file, { contentType: "image/png" });
  console.log("✅ uploaded:", path);

  const editFn = httpsCallable(functions, "edit_image");
  const response = await editFn({ filePath: path, prompt });

  const { generatedUrl } = response.data as { generatedUrl: string };
  console.log("🎉 generated:", generatedUrl);

  return generatedUrl;
}