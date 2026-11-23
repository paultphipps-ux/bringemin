import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        ink: { DEFAULT: "#0B0B0C", 2: "#111113", 3: "#16161A", line: "#242428", edge: "#2E2E34" },
        bone: { DEFAULT: "#F2F2F0", muted: "#C9C9CE", dim: "#A8A8AE" },
        brand: { DEFAULT: "#C10102", hover: "#990102", text: "#FF5247" },
        steel: { DEFAULT: "#C2C3C5", dark: "#8A8B90" },
        paper: { DEFAULT: "#F6F6F4", line: "#E2E2DD" },
      },
      fontFamily: {
        display: ["Montserrat", "Arial Black", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
