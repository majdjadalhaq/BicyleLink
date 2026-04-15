/**
 * Centralized animation constants for Framer Motion and GSAP transitions.
 * Use these instead of magic numbers to ensure project-wide consistency.
 */

export const DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  ENTRANCE: 0.8,
};

export const EASINGS = {
  OUT: [0.21, 1.11, 0.81, 0.99], // Custom springy ease-out
  SMOOTH: [0.4, 0, 0.2, 1],
  ANTICIPATE: [0.45, 0, 0.55, 1],
};

export const STAGGER = {
  QUICK: 0.05,
  NORMAL: 0.1,
  SLOW: 0.18,
};

export const TRANSITIONS = {
  SPRING: {
    type: "spring",
    damping: 20,
    stiffness: 100,
  },
  DEFAULT: {
    duration: DURATIONS.SLOW,
    ease: EASINGS.OUT,
  },
};
