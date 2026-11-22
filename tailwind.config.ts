import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        ink: { DEFAULT: "#0E0E10", 2: "#121215", 3: "#17171A", line: "#26262B", edge: "#2E2E34" },
        bone: { DEFAULT: "#F2F2F0", muted: "#C9C9CE", dim: "#A8A8AE" },
        brand: { DEFAULT: "#C8102E", hover: "#A50E26", text: "#FF6B6B" },
        paper: { DEFAULT: "#F6F6F4", line: "#E2E2DD" },
      },
      fontFamily: {
        display: ["Oswald", "Impact", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
