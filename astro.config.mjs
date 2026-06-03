import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
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

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],

  site: process.env.SITE_URL || "https://waltahh.vercel.app",

  vite: {
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
    },
  },
});
