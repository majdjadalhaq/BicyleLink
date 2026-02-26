export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Emerald Palette
        primary: {
          light: "#34D399",
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        emerald: {
          DEFAULT: "#10B981",
          hover: "#059669",
          light: "#34D399",
          muted: "#10B98133",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // Dark Mode Surfaces
        dark: {
          bg: "#121212",
          surface: "#1a1a1a",
          "surface-hover": "#242424",
          border: "#2a2a2a",
          input: "#1e1e1e",
          card: "#1a1a1a",
        },
        // Light Mode Surfaces
        light: {
          bg: "#F9FAFB",
          surface: "#FFFFFF",
          "surface-hover": "#F3F4F6",
          border: "#E5E7EB",
          input: "#F3F4F6",
          card: "#FFFFFF",
        },
        muted: "#9CA3AF",
        // Semantic Colors
        success: { DEFAULT: "#10B981", light: "#D1FAE5", dark: "#065F46" },
        danger: { DEFAULT: "#EF4444", light: "#FEE2E2", dark: "#991B1B" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7", dark: "#92400E" },
        info: { DEFAULT: "#3B82F6", light: "#DBEAFE", dark: "#1E40AF" },
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "emerald-glow": "0 0 15px rgba(16, 185, 129, 0.3)",
        "emerald-glow-strong": "0 0 25px rgba(16, 185, 129, 0.5)",
        "emerald-glow-xl": "0 0 60px rgba(16, 185, 129, 0.15)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "card-hover-dark": "0 8px 30px rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        heartBeat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.2)" },
          "50%": { transform: "scale(0.95)" },
          "75%": { transform: "scale(1.1)" },
        },
        pedal: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        slideDown: "slideDown 0.3s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        heartBeat: "heartBeat 0.4s ease-out",
        "spin-slow": "spin 3s linear infinite",
        pedal: "pedal 0.6s ease-in-out infinite",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
      },
    },
  },
  plugins: [],
};
