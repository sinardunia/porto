import type { APIRoute } from "astro";
import { getPublishedBlogPostSummaries } from "@/lib/blog";
import { SITE_URL } from "@/data/config";

export const prerender = true;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

type SitemapUrl = {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

const staticRoutes: SitemapUrl[] = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/blog", priority: "0.9", changefreq: "daily" },
  { url: "/disclaimer", priority: "0.3", changefreq: "monthly" },
  { url: "/rss.xml", priority: "0.5", changefreq: "daily" },
];

export const GET: APIRoute = async () => {
  try {
    const posts = await getPublishedBlogPostSummaries(500);

    const blogUrls: SitemapUrl[] = posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updated_at
        ? new Date(post.updated_at).toISOString().split("T")[0]
        : new Date(post.created_at).toISOString().split("T")[0],
      priority: "0.8",
      changefreq: "weekly",
    }));

    const allUrls = [...staticRoutes, ...blogUrls];

    const urlsXml = allUrls
      .map(
        (item) => `    <url>
      <loc>${escapeXml(new URL(item.url, SITE_URL).toString())}</loc>
      ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}
      <changefreq>${item.changefreq}</changefreq>
      <priority>${item.priority}</priority>
    </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error instanceof Error ? error.message : error);
    return new Response("", {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
};
