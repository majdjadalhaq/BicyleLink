export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#34D399",
          DEFAULT: "#10B981", // Emerald Accent
          dark: "#059669",
        },
        dark: {
          bg: "#121212", // Deep Charcoal/Off-Black
          surface: "#1E1E1E", // Secondary Background
          border: "#333333",
          input: "#2A2A2A",
        },
        light: {
          bg: "#F9FAFB",
          surface: "#FFFFFF",
          border: "#E5E7EB",
          input: "#F3F4F6",
        },
        muted: "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
      boxShadow: {
        "emerald-glow": "0 0 15px rgba(16, 185, 129, 0.3)",
        "emerald-glow-strong": "0 0 25px rgba(16, 185, 129, 0.5)",
      },
    },
  },
  plugins: [],
};
