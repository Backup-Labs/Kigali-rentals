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
          deep: "#0D3846",
          "deep-dark": "#07232C",
          "deep-light": "#174F61",
          accent: "#C85A2A",
          "accent-hover": "#B24F23",
          "accent-light": "#FDF2EC",
          surface: "#E6D7C3",
          "surface-light": "#F9F6F0",
          "surface-card": "#FAF7F2",
          muted: "#5A6B3C",
          "muted-light": "#F1F5EB",
        },
        terracotta: {
          50: "#FDF7F4",
          100: "#FAEDE6",
          200: "#F5DACD",
          500: "#D96837",
          DEFAULT: "#C85A2A",
          600: "#C85A2A",
          700: "#B24F23",
          800: "#8D3E1A",
          900: "#5E2911",
        },
        sand: {
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#E6D7C3",
          DEFAULT: "#E6D7C3",
          300: "#D6C0A5",
          400: "#BEA484",
          800: "#564736",
          900: "#382E22",
        },
        olive: {
          50: "#F4F6EE",
          100: "#E6EBDB",
          500: "#6B7F47",
          DEFAULT: "#5A6B3C",
          600: "#5A6B3C",
          700: "#44522C",
          800: "#313B1F",
        },
      },
      fontFamily: {
        tenor: ["var(--font-tenor)", "Tenor Sans", "serif"],
        syne: ["var(--font-tenor)", "Tenor Sans", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        price: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

