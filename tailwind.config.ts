import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#8b5cf6",
          glow: "#a78bfa",
        },
      },
      boxShadow: {
        glow: "0 0 40px -12px rgb(139 92 246 / 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
