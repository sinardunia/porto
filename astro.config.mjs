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

  // EXTREME PREFETCH - Hover to preload pages instantly
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  integrations: [
    tailwind({
      // Minimize CSS output
      applyBaseStyles: false,
    }), 
    sitemap(),
  ],

  site: process.env.SITE_URL || "http://localhost:4321",

  vite: {
    build: {
      // CSS inline untuk file kecil (< 4KB)
      assetsInlineLimit: 4096,
      // Code splitting untuk JS
      cssCodeSplit: true,
    },
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