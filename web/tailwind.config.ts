import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "card-hover":
          "0 4px 12px 0 rgba(2, 132, 199, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.03)",
      },
      colors: {
        canvas: "hsl(var(--bg-canvas))",
        surface: "hsl(var(--bg-surface))",
        subtle: "hsl(var(--bg-subtle))",
      },
    },
  },
  plugins: [],
};

export default config;
