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
    const posts = await getPublishedBlogPostSummaries(50);

    const items = await Promise.all(
      posts.map(async (post) => {
        const url = new URL(`/blog/${post.slug}`, SITE_URL).toString();
        const description = await sanitizeRenderedHtml(escapeXml(post.description || ""));
        const categoriesXml = post.tags
          .map((tag) => `      <category>${escapeXml(tag)}</category>`)
          .join("\n");

        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.pubDatetime).toUTCString()}</pubDate>
      <description>${description}</description>
${categoriesXml}
    </item>`;
      })
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Article</title>
    <link>${SITE_URL}</link>
    <description>A quiet personal archive of thoughts, writing, and experiments.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/opengraph-image.png</url>
      <title>Porto</title>
      <link>${SITE_URL}</link>
    </image>
${items.join("\n")}
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
    return new Response("", { status: 500 });
  }
};
