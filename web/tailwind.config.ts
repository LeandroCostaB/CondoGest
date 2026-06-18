import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3F3D6B",
          light: "#5C5894",
          dark: "#2E2C4E",
        },
        accent: {
          DEFAULT: "#2F5233",
        },
        chart: {
          DEFAULT: "#7C83E8",
        },
        danger: {
          DEFAULT: "#DC4C4C",
        },
      },
    },
  },
  plugins: [],
};

export default config;
