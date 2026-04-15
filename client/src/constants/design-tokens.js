/**
 * BICYCLELINK DESIGN SYSTEM TOKENS
 * Derived from ui-ux-pro-max and premium Awwwards standards.
 */

export const SPACING = {
  BASE: 8,
  PX: {
    XS: "4px", // 0.5rem
    SM: "8px", // 1rem
    MD: "16px", // 2rem - The target padding for cards
    LG: "24px", // 3rem
    XL: "32px", // 4rem
    XXL: "48px", // 6rem
    SECTION: "64px",
  },
};

export const TYPOGRAPHY = {
  // Fluid scale: clamp(min, preferred, max)
  H1: "clamp(2.5rem, 5vw, 4.5rem)",
  H2: "clamp(2rem, 4vw, 3rem)",
  H3: "clamp(1.5rem, 3vw, 2rem)",
  BODY: "1rem",
  METADATA: "0.75rem",
  CAPS_LABEL: "text-[10px] font-black uppercase tracking-widest",
};

export const SHADOWS = {
  SUBTLE: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  PREMIUM: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  GLASS: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
};

export const DURATIONS = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  ENTRANCE: 0.8,
};

export const EASINGS = {
  OUT: [0.21, 1.11, 0.81, 0.99],
  SMOOTH: [0.4, 0, 0.2, 1],
  ANTICIPATE: [0.45, 0, 0.55, 1],
};

export const SPRING = {
  SOFT: { type: "spring", stiffness: 100, damping: 20 },
  SNAPPY: { type: "spring", stiffness: 400, damping: 30 },
  BOUNCY: { type: "spring", stiffness: 260, damping: 20 },
};

export const STAGGER = {
  QUICK: 0.05,
  NORMAL: 0.1,
  SLOW: 0.18,
};
