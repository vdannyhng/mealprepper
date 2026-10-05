"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "meal-prep-photos";
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

/** Downscales large photos in the browser so uploads stay fast on mobile connections. */
async function downscale(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    return blob ?? file;
  } catch {
    // Formats the browser cannot decode (e.g. HEIC on some devices) are uploaded as-is.
    return file;
  }
}

/**
 * Uploads a proof photo to the private bucket under "<userId>/…". Storage policies
 * only allow writing into the user's own folder. Returns the storage path.
 */
export async function uploadProofPhoto(
  file: File,
  userId: string,
  sessionId: string,
): Promise<string> {
  const blob = await downscale(file);
  const extension = blob.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() ?? "img");
  const path = `${userId}/${sessionId}-${Date.now()}.${extension}`;
  const { error } = await createClient()
    .storage.from(BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type, upsert: false });
  if (error) throw new Error("Das Foto konnte nicht hochgeladen werden.", { cause: error });
  return path;
}

/** Removes an uploaded photo again, e.g. when saving the session failed. Best effort. */
export async function removeProofPhoto(path: string): Promise<void> {
  await createClient()
    .storage.from(BUCKET)
    .remove([path])
    .catch(() => undefined);
}
