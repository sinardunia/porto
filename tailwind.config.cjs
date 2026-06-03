/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],

  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        primary: {
          light: "#ffffff",
          dark: "#0a0a0a",
        },
        secondary: {
          light: "#f7f7f7",
          dark: "#111111",
        },
        text: {
          light: "#171717",
          dark: "#f5f5f5",
        },
        border: {
          light: "#e5e5e5",
          dark: "#262626",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "42rem",
            lineHeight: "1.75",
          },
        },
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
};
