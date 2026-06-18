import type { Config } from "tailwindcss";

/**
 * Design tokens for AlgoVision.
 *
 * Colours resolve to CSS variables (space-separated RGB triplets) so the entire
 * palette can flip between dark and light themes without touching component
 * markup. We also remap Tailwind's `zinc` scale to variables: existing
 * `text-zinc-*` usages then invert automatically per theme.
 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: v("--bg"), subtle: v("--bg-subtle") },
        surface: {
          DEFAULT: v("--surface"),
          raised: v("--surface-raised"),
          border: v("--surface-border"),
        },
        accent: { DEFAULT: "#7c5cff", soft: "#a78bfa", muted: "#312e81" },
        success: "#34d399",
        danger: "#f87171",
        warning: "#fbbf24",
        // Themed greyscale — same class names, theme-aware values.
        zinc: {
          100: v("--z100"),
          200: v("--z200"),
          300: v("--z300"),
          400: v("--z400"),
          500: v("--z500"),
          600: v("--z600"),
        },
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
