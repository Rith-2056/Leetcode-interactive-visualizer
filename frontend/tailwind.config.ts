import type { Config } from "tailwindcss";

/**
 * Design tokens for AlgoVision. The palette leans on a deep, near-black
 * background with a single vivid accent (indigo/violet) — inspired by Linear,
 * Vercel and Raycast. Surfaces use subtle elevation rather than hard borders.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          subtle: "#0f0f17",
        },
        surface: {
          DEFAULT: "#15151f",
          raised: "#1c1c2a",
          border: "#26263a",
        },
        accent: {
          DEFAULT: "#7c5cff",
          soft: "#a78bfa",
          muted: "#312e81",
        },
        success: "#34d399",
        danger: "#f87171",
        warning: "#fbbf24",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(124,92,255,0.4), 0 0 24px rgba(124,92,255,0.25)",
      },
      keyframes: {
        "pulse-line": {
          "0%, 100%": { backgroundColor: "rgba(124,92,255,0.12)" },
          "50%": { backgroundColor: "rgba(124,92,255,0.28)" },
        },
      },
      animation: {
        "pulse-line": "pulse-line 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
