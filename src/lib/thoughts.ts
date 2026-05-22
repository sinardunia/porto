/**
 * Optimasi gambar via Supabase Image Transformation.
 */
export const getOptimizedMedia = (url: string, width = 800) => {
  if (!url || !url.includes("supabase.co")) return url;
  return `${url}?width=${width}&quality=70&format=webp`;
};