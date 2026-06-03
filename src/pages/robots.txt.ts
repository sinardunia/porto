import type { APIRoute } from "astro";
import { SITE_URL } from "@/data/config";

export const prerender = true;

export const GET: APIRoute = () => {
  const sitemap = new URL("/sitemap.xml", SITE_URL).toString();

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}

Disallow: /admin/
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=86400",
    },
  });
};
