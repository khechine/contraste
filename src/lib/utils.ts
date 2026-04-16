/**
 * Converts a string to a URL-friendly slug.
 * Handles French accents and special characters.
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .normalize('NFD')                   // Normalize to decomposition
    .replace(/[\u0300-\u036f]/g, '')     // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                // Replace spaces with -
    .replace(/[^\w-]+/g, '')             // Remove all non-word chars
    .replace(/--+/g, '-')                // Replace multiple - with single -
    .replace(/^-+/, '')                  // Trim - from start
    .replace(/-+$/, '');                 // Trim - from end
}
