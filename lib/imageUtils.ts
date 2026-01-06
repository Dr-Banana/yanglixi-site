/**
 * No longer converts HEIC files as support has been removed.
 * Returns the original file.
 */
export async function convertHeicToJpeg(file: File | Blob): Promise<Blob | File> {
  return file;
}

/**
 * Converts a file or blob to a Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
