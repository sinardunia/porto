import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),

  security: {
    checkOrigin: false,
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  integrations: [tailwind(), sitemap()],

  site: process.env.SITE_URL || "http://localhost:4321",

  vite: {
    optimizeDeps: {
      include: ["easymde"],
    },
    server: {
      allowedHosts: true,
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https:;",
      },
    },
  },
});