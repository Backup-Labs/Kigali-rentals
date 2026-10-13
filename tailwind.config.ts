import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          azure: "#00638E",
          "azure-dark": "#004A6B",
          "azure-deep": "#003060",
          "azure-light": "#8CB9CC",
          "azure-soft": "#BFD8E3",
          onyx: "#141414",
          charcoal: "#2B2B2B",
          white: "#FFFFFF",
          surface: "#F4F8FA",
        },
        azure: {
          50: "#F0F6F9",
          100: "#E1EEF4",
          200: "#BFD8E3",
          300: "#8CB9CC",
          400: "#4A94B7",
          500: "#00638E",
          600: "#00557B",
          700: "#004A6B",
          800: "#003A54",
          900: "#003060",
          DEFAULT: "#00638E",
        },
        onyx: {
          DEFAULT: "#141414",
          pure: "#000000",
          surface: "#1A1A1A",
        },
        charcoal: {
          DEFAULT: "#2B2B2B",
          light: "#3E3E3E",
          dark: "#1F1F1F",
        },
      },
      fontFamily: {
        tenor: ["var(--font-tenor)", "Tenor Sans", "serif"],
        syne: ["Syne", "sans-serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        price: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

