import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 16px 40px rgba(55, 33, 9, 0.10)",
      },
      colors: {
        brand: {
          50: "#fff6ed",
          100: "#fee8d3",
          200: "#fbd0a6",
          300: "#f7b271",
          400: "#f08e42",
          500: "#dc6d22",
          600: "#bd5418",
          700: "#9a4116",
          800: "#7c3517",
          900: "#652d16",
        },
      },
    },
  },
  plugins: [],
};

export default config;
