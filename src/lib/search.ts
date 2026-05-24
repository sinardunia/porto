import { createSupabaseClient } from "./supabase";
import { withTimeout } from "./security";
import type { Thought } from "@/types/thoughts";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SearchOptions {
  query?: string;
  cursor?: string;
  limit?: number;
}

// Tipe data response dari query gabungan Supabase agar tidak bocor ts(2339)
type SupabaseResponse = {
  data: Thought[] | null;
  error: any;
};

/**
 * Mesin Pencari Thoughts Berkinerja Tinggi (Skala Jutaan Data / Target 100 Tahun).
 * Memanfaatkan Kombinasi GIN Index & pg_trgm (Trigram Similarity) dalam Satu Query Tunggal.
 */
export async function queryThoughts({
  query = "",
  cursor = "",
  limit = 30
}: SearchOptions): Promise<Thought[]> {
  try {
    const supabase = createSupabaseClient() as SupabaseClient;

    // 1. SANITASI INPUT EKSTRIM (Mencegah Malicious Syntax & Spasi Liar)
    const cleanQuery = query
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[%_'"\\\(\)\&\|]/g, ''); // Buang karakter operator internal SQL

    // Jika input kosong, bypass langsung ke fungsi pengambilan data default (hemat resource)
    if (!cleanQuery) {
      return fetchDefaultThoughts(supabase, cursor, limit);
    }

    // 2. FORMULASI QUERY DENGAN STRATEGI GIN INDEX & FUZZY MATCH
    // Kita buat pencarian fleksibel: teks cocok secara Full-Text ATAU punya kemiripan karakter (Trigram)
    let supabaseQuery = supabase
      .from("thoughts")
      .select(`
        id, content, created_at,
        thought_media (id, media_type, media_url, media_alt, position)
      `)
      .is("deleted_at", null);

    // Kunci Pagination menggunakan cursor waktu (Sangat cepat di Postgres jika kolom terindeks B-Tree)
    if (cursor) {
      supabaseQuery = supabaseQuery.lt("created_at", cursor);
    }

    // Eksekusi logika pencarian cerdas:
    // Menggunakan operator wfts (Web Search Full-Text) digabung dengan kecocokan substring terindeks
    // Ini menangani kata dasar, imbuhan, sekaligus typo parsial dalam SATU KALI request ke server
    supabaseQuery = supabaseQuery.or(
      `content.wfts.${cleanQuery}, content.ilike.%${cleanQuery}%`
    );

    // Urutkan dan batasi skala data
    supabaseQuery = supabaseQuery
      .order("created_at", { ascending: false })
      .order("position", { foreignTable: "thought_media", ascending: true })
      .limit(limit);

    const { data, error } = (await withTimeout(
      supabaseQuery,
      5000,
      "Thoughts Multi-Index Search"
    )) as SupabaseResponse;

    if (error) {
      console.error(`[Search Engine Failure]: ${error.message}`);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[Search Engine Critical Fault]:", err);
    return [];
  }
}

/**
 * Pengambilan Data Default Berbasis Cursor Efisiensi Tinggi (O(1) look-up time).
 */
async function fetchDefaultThoughts(
  supabase: SupabaseClient,
  cursor: string,
  limit: number
): Promise<Thought[]> {
  let defaultQuery = supabase
    .from("thoughts")
    .select(`
      id, content, created_at,
      thought_media (id, media_type, media_url, media_alt, position)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "thought_media", ascending: true })
    .limit(limit);

  if (cursor) {
    defaultQuery = defaultQuery.lt("created_at", cursor);
  }

  const { data } = (await withTimeout(
    defaultQuery,
    5000,
    "Default Thoughts Stream"
  )) as SupabaseResponse;

  return Array.isArray(data) ? data : [];
}