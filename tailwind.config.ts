// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'component-background': "var(--component-background)",
        'border-color': "var(--border-color)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
      },
    },
  },
  plugins: [],
} satisfies Config;