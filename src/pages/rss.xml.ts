import type { APIRoute } from "astro";
import { getPublishedBlogPostSummaries } from "@/lib/blog";
import { SITE_URL } from "@/data/config";
import { sanitizeRenderedHtml } from "@/lib/security";

export const prerender = true;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async () => {
  try {
    const posts = await getPublishedBlogPostSummaries(25);

    const items = await Promise.all(
      posts.map(async (post) => {
        const url = new URL(`/blog/${post.slug}`, SITE_URL).toString();
        const description = await sanitizeRenderedHtml(escapeXml(post.excerpt || ""));
        const tags = Array.isArray(post.tags) ? post.tags.filter((t): t is string => typeof t === "string") : [];
        const categoriesXml = tags.map((tag) => `    <category>${escapeXml(tag)}</category>`).join("\n");

        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description>${description}</description>
${categoriesXml}
    </item>`;
      })
    );
    const itemsXml = items.join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Fuji Halim Rabani</title>
    <link>${SITE_URL}</link>
    <description>A quiet personal archive of thoughts, writing, and experiments.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/opengraph-image.jpg</url>
      <title>Fuji Halim Rabani</title>
      <link>${SITE_URL}</link>
    </image>
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
