import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#FFC72C",
          "gold-dark": "#E5B224",
          "gold-light": "#FFD54F",
          "gold-pale": "#FFF9E6",
          obsidian: "#0B0C0E",
          charcoal: "#141519",
          surface: "#1A1B20",
          card: "#141519",
          onyx: "#111111",
          white: "#FFFFFF",
          azure: "#FFC72C",
          "azure-dark": "#E5B224",
          "azure-deep": "#111111",
          "azure-light": "#FFD54F",
          "azure-soft": "rgba(255, 199, 44, 0.2)",
        },
        gold: {
          DEFAULT: "#FFC72C",
          50: "#FFFDF0",
          100: "#FFF9CC",
          200: "#FFF299",
          300: "#FFE666",
          400: "#FFD733",
          500: "#FFC72C",
          600: "#E5B224",
          700: "#D4A017",
          800: "#B8860B",
          900: "#805B00",
        },
        azure: {
          50: "rgba(255, 199, 44, 0.05)",
          100: "rgba(255, 199, 44, 0.1)",
          200: "rgba(255, 199, 44, 0.2)",
          300: "#FFE082",
          400: "#FFD54F",
          500: "#FFC72C",
          600: "#E5B224",
          700: "#D4A017",
          800: "#B8860B",
          900: "#805B00",
          DEFAULT: "#FFC72C",
        },
        onyx: {
          DEFAULT: "#111111",
          pure: "#000000",
          surface: "#16171A",
        },
        charcoal: {
          DEFAULT: "#141519",
          light: "#22242B",
          dark: "#0B0C0E",
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
