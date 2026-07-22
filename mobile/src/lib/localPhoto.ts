import * as FileSystem from 'expo-file-system/legacy';

const PHOTO_DIR = `${FileSystem.documentDirectory}plant-photos/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
}

/**
 * Persists a picked/captured image into the app's document directory and returns
 * a stable `file://` URI. Image-picker URIs live in a cache that the OS can purge,
 * so we copy the file somewhere durable and store that path on the plant.
 */
export async function savePhoto(uri: string): Promise<string> {
  await ensureDir();
  const extMatch = uri.split('?')[0].match(/\.(jpe?g|png|webp|heic)$/i);
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();
  const dest = `${PHOTO_DIR}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

/** Best-effort delete of a stored photo (ignored if it is missing or external). */
export async function deletePhoto(uri: string | null | undefined): Promise<void> {
  if (!uri || !uri.startsWith(PHOTO_DIR)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Non-fatal.
  }
}
