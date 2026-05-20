import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),

  security: {
    checkOrigin: false,
  },

  integrations: [tailwind(), sitemap()],

  site: process.env.SITE_URL,

  vite: {
    server: {
      allowedHosts: true,
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https:;",
      },
    },
  },
});