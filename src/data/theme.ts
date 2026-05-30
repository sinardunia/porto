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
    primary: "slate",

    blur: {
      top: "slate",
      bottom: "slate",
    },

    light: {
      background: "#fafaf9",
      text: "#292524",
      primary: "#57534e",
    },

    dark: {
      background: "#0c0a09",
      text: "#e7e5e4",
      primary: "#a8a29e",
    },
  },
};

export default theme;