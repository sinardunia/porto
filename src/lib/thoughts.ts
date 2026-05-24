/**
 * Optimasi gambar via Supabase Image Transformation.
 */
export const getOptimizedMedia = (url: string, width = 800) => {
  if (!url || !url.includes("supabase.co")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}width=${width}&quality=70&format=webp`;
};