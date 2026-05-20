import { createSupabaseClient } from "./supabase";
import type { Thought } from "../types/thoughts";

// FIX SSR LEAK: Deklarasikan client di level module root (Singleton) 
// untuk mencegah kebocoran koneksi TCP di setiap hit SSR Astro
const supabase = createSupabaseClient();

/**
 * Helper untuk mengoptimasi gambar menggunakan Supabase Image Transformation.
 * Validasi ketat tipe media langsung tanpa kompromi tebak-tebakan.
 */
export const getOptimizedMedia = (url: string, mediaType: string = "image", width = 800) => {
  if (!url || !url.includes("supabase.co")) return url;
  if (mediaType === "video") return url;
  
  // Mengunci kualitas di 70, format modern webp untuk scrolling kilat
  return `${url}?width=${width}&quality=70&format=webp`;
};

/**
 * Fetcher utama anti-kolaps (Production-Grade).
 * Kebal dari SQL Injection, Tuple Skipping, DoS Parameter, dan Koneksi Bocor.
 */
export const fetchThoughts = async (options?: { cursor?: { created_at: string; id: string | number }; limit?: number }) => {
  // 1. HARD-CAPPING DOS PROTECTION: Batasi angka limit secara absolut di level pertahanan backend
  const requestedLimit = options?.limit || 20;
  const safeLimit = Math.min(Math.max(requestedLimit, 1), 50);

  // Ambil data ekstra +1 untuk kalkulasi kepastian indikator hasMore di memori server
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
    // Kembalikan logika sortir ke SQL engine, jauh lebih cepat daripada sortir manual di CPU HP low-end
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .order("position", { foreignTable: "thought_media", ascending: true })
    .limit(safeLimit + 1);

  // 2. PARSING & CASTING SECURITY FILTER
  if (options?.cursor && options.cursor.created_at && options.cursor.id) {
    const safeId = Number(options.cursor.id);
    const safeDate = new Date(options.cursor.created_at).toISOString();

    // Pastikan parameter murni bersih sebelum menyentuh engine database
    if (!Number.isNaN(safeId) && safeDate !== "Invalid Date") {
      // FIX TUPLE SKIPPING: Klausa nested yang presisi untuk menghindari pemotongan data sewaktu
      query = query.or(`created_at.lt.${safeDate},and(created_at.eq.${safeDate},id.lt.${safeId})`);
    }
  }

  const { data, error } = await query;

  // 3. SECURE ERROR HANDLER: Jangan kembalikan status sukses palsu jika database sedang hancur
  if (error) {
    console.error("[CRITICAL SYSTEM ERROR] Database Fetch Failure:", error.message);
    throw new Error("Gagal mengambil data dari server log. Silakan coba beberapa saat lagi.");
  }

  if (!data || data.length === 0) {
    return { thoughts: [], hasMore: false };
  }

  const informedHasMore = data.length > safeLimit;
  const productionData = informedHasMore ? data.slice(0, safeLimit) : data;

  // Sanitasi strings dan mapping data akhir
  const thoughts = productionData.map((thought: any) => ({
    ...thought,
    content: thought.content ? thought.content.trim() : "",
    thought_media: Array.isArray(thought.thought_media) ? thought.thought_media : []
  })) as Thought[];

  return {
    thoughts,
    hasMore: informedHasMore
  };
};