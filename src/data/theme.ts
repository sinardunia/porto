import type { TailwindColor } from "@/utils/types/tailwind";

type Theme = {
  colors: {
    primary: TailwindColor;

    blur: {
      top: TailwindColor;
      bottom: TailwindColor;
    };

    light: {
      background: string;
      text: string;
      primary: string;
    };

    dark: {
      background: string;
      text: string;
      primary: string;
    };
  };
};
const theme: Theme = {
  colors: {
    primary: "orange",

    blur: {
      top: "orange",
      bottom: "orange",
    },

    light: {
      background: "#ffffff",
      text: "#171717",
      primary: "#9a3412",
    },

    dark: {
      background: "#0a0a0a",
      text: "#f5f5f5",
      primary: "#c2410c",
    },
  },
};

export default theme;