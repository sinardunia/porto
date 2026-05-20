import { createSupabaseClient } from "./supabase";
import type { Thought } from "../types/thoughts";

/**
 * Helper untuk mengoptimasi gambar menggunakan Supabase Image Transformation.
 * Membuat loading 10x lebih cepat karena tidak mendownload file asli yang besar.
 */
export const getOptimizedMedia = (url: string, width = 800) => {
  // Jika bukan dari Supabase (misal placeholder atau external), kembalikan langsung
  if (!url.includes("supabase.co")) return url;
  
  // Memaksa format webp dan resize di sisi server Supabase
  return `${url}?width=${width}&quality=75&format=webp`;
};

/**
 * Fetcher utama untuk mengambil daftar postingan.
 * Sudah include join ke tabel media dan pengurutan posisi.
 */
export const fetchThoughts = async (options?: { cursor?: string; limit?: number }) => {
  const supabase = createSupabaseClient();
  const limit = options?.limit || 20;

  let query = supabase
    .from("thoughts")
    .select(`
      id,
      content,
      created_at,
      thought_media (
        id,
        media_type,
        media_url,
        media_alt,
        position
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    // Penting: Memastikan urutan gambar di dalam satu post tidak acak
    .order("position", { foreignTable: "thought_media", ascending: true })
    .limit(limit);

  // Pagination menggunakan cursor (kunci kecepatan social media)
  if (options?.cursor) {
    query = query.lt("created_at", options.cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching thoughts:", error.message);
    return [];
  }

  return (data as unknown as Thought[]) || [];
};