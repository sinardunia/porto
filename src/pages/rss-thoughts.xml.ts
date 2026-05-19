import type { APIRoute } from "astro";
import { createSupabaseClient } from "@/lib/supabase";
import { SITE_URL } from "@/data/config";
import { withTimeout } from "@/lib/security";

export const prerender = false;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await withTimeout(
      supabase
        .from("thoughts")
        .select("id, content, created_at")
        .eq("is_published", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
      10000,
      "RSS thoughts fetch"
    );

    if (error) throw error;

    const items = (data ?? []).map((thought) => {
      const url = new URL(`/thoughts#${thought.id}`, SITE_URL).toString();
      const title = new Date(thought.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      return `
        <item>
          <title>${escapeXml(title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <pubDate>${new Date(thought.created_at).toUTCString()}</pubDate>
          <description>${escapeXml(thought.content)}</description>
        </item>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>Fuji Halim Rabani — Thoughts</title>
          <link>${new URL("/thoughts", SITE_URL).toString()}</link>
          <description>Small notes from a quiet personal archive.</description>
          ${items}
        </channel>
      </rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Thoughts RSS generation failed:", error instanceof Error ? error.message : error);
    return new Response("", {
      status: 500,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  }
};
