/**
 * Resize and re-encode an image in the browser. Shared hosting cannot process
 * images on the server, so the upload is already small when it arrives.
 */
const MAX_SIDE = 1600;
const QUALITY = 0.82;

export type CompressedImage = { blob: Blob; width: number; height: number };

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function compressImage(file: Blob): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D tidak tersedia.");
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await toBlob(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") {
      // Older Safari cannot encode WebP. JPEG has no transparency, so paint white first.
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      blob = await toBlob(canvas, "image/jpeg");
    }
    if (!blob) throw new Error("Foto tidak dapat dikompres.");
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}
