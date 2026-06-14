import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import remarkExternalLinks from "remark-external-links";

export default defineConfig({
  output: "server",
  adapter: vercel(),

  markdown: {
    remarkPlugins: [
      [
        remarkExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },

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

  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fdkhfkxysmmtwjzgmuvy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  vite: {
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
    },
  },
});
