import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  output: "server",

  adapter: vercel(),

  integrations: [
    tailwind(),
    sitemap(),
  ],

  site: process.env.SITE_URL,

  markdown: {
    syntaxHighlight: "shiki",

    shikiConfig: {
      theme: "nord",
      wrap: false,
    },
  },
});