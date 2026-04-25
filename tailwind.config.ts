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
        soft: "0 20px 48px rgba(54, 35, 15, 0.08)",
        panel: "0 10px 30px rgba(47, 31, 16, 0.08)",
      },
      colors: {
        brand: {
          50: "#f8f1e8",
          100: "#efe2d2",
          200: "#dfc6aa",
          300: "#c9a277",
          400: "#b27f4e",
          500: "#996131",
          600: "#7e4b23",
          700: "#63381b",
          800: "#4e2d18",
          900: "#3e2415",
        },
      },
    },
  },
  plugins: [],
};

export default config;
