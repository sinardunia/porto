import type { APIRoute } from "astro";
import { getPublishedBlogPostSummaries, collectTagCounts } from "@/lib/blog";
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
  { url: "/tags", priority: "0.6", changefreq: "weekly" },
  { url: "/about", priority: "0.5", changefreq: "yearly" },
  { url: "/contact", priority: "0.4", changefreq: "yearly" },
  { url: "/privacy", priority: "0.3", changefreq: "yearly" },
  { url: "/terms", priority: "0.3", changefreq: "yearly" },
  { url: "/disclaimer", priority: "0.3", changefreq: "yearly" },
];

export const GET: APIRoute = async () => {
  try {
    const posts = await getPublishedBlogPostSummaries();
    const tagCounts = collectTagCounts(posts);

    const blogUrls: SitemapUrl[] = posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: (post.modDatetime
        ? new Date(post.modDatetime)
        : new Date(post.pubDatetime)
      )
        .toISOString()
        .split("T")[0],
      priority: post.featured ? "0.9" : "0.8",
      changefreq: "weekly",
    }));

    const tagUrls: SitemapUrl[] = tagCounts.map((tag) => ({
      url: `/tags/${tag.slug}`,
      priority: "0.5",
      changefreq: "weekly",
    }));

    const allUrls = [...staticRoutes, ...tagUrls, ...blogUrls];

    const urlsXml = allUrls
      .map(
        (item) => `  <url>
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
    return new Response("", { status: 500 });
  }
};
