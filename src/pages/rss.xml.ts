import type { APIRoute } from "astro";
import { createSupabaseClient } from "@/lib/supabase";
import { SITE_URL } from "@/data/config";
import { sanitizeRenderedHtml, withTimeout } from "@/lib/security";

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
        .from("blog_posts")
        .select("slug, title, excerpt, created_at")
        .eq("is_published", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(25),
      10000,
      "RSS blog posts fetch"
    );

    if (error) throw error;

    const items = await Promise.all(
      (data ?? []).map(async (post) => {
        const url = new URL(`/blog/${post.slug}`, SITE_URL).toString();
        const description = await sanitizeRenderedHtml(escapeXml(post.excerpt || ""));

        return `
          <item>
            <title>${escapeXml(post.title)}</title>
            <link>${url}</link>
            <guid>${url}</guid>
            <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
            <description>${description}</description>
          </item>`;
      })
    );
    const itemsXml = items.join("");

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>Fuji Halim Rabani</title>
          <link>${SITE_URL}</link>
          <description>A quiet personal archive.</description>
          ${itemsXml}
        </channel>
      </rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("RSS generation failed:", error instanceof Error ? error.message : error);
    return new Response("", {
      status: 500,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  }
};
