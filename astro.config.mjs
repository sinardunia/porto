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

  integrations: [
    tailwind(),
    sitemap(),
  ],

  site: process.env.SITE_URL,
});