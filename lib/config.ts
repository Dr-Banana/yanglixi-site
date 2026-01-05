/**
 * Application configuration constants
 */

/**
 * Accepted image file formats for upload
 * This is used across all post types (Recipe, Blog, Home Kitchen, Activity)
 */
export const ACCEPTED_IMAGE_FORMATS = 'image/*,image/heic,image/heif,.heic,.heif';

/**
 * Valid image file extensions
 */
export const VALID_IMAGE_EXTENSIONS = ['.heic', '.heif'];

/**
 * Check if a file is a valid image type
 * Supports HEIC/HEIF formats through file extension check
 */
export function isValidImageFile(file: File): boolean {
  // Check MIME type
  if (file.type.startsWith('image/')) {
    return true;
  }
  
  // Check file extension for HEIC/HEIF (some browsers may not recognize MIME type)
  const fileName = file.name.toLowerCase();
  return VALID_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

