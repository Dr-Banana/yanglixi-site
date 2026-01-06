/**
 * Application configuration constants
 */

/**
 * Accepted image file formats for upload
 * This is used across all post types (Recipe, Blog, Home Kitchen, Activity)
 */
export const ACCEPTED_IMAGE_FORMATS = 'image/jpeg,image/png,image/gif,image/webp';

/**
 * Valid image file extensions
 */
export const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Check if a file is a valid image type
 */
export function isValidImageFile(file: File): boolean {
  const type = file.type.toLowerCase();
  return (
    type === 'image/jpeg' || 
    type === 'image/png' || 
    type === 'image/gif' || 
    type === 'image/webp'
  );
}

