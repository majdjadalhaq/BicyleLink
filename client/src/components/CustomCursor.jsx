import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

/**
 * Optimized Custom Cursor.
 * Uses Motion Values and transforms to keep styling off the main thread.
 */
export const CustomCursor = () => {
  const [cursorType, setCursorType] = useState("default");
  
  // Use MotionValues for absolute performance - no React re-renders on mouse move
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs to avoid "jerkiness" which triggers reflows
  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isLink = target.closest("a, button, [role='button']");
      const isCard = target.closest(".listing-card");

      if (isLink) {
        setCursorType("hover");
      } else if (isCard) {
        setCursorType("card");
      } else {
        setCursorType("default");
      }
    };

    // Use passive listener to avoid blocking the main thread
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      width: 14,
      height: 14,
      backgroundColor: "var(--color-emerald)",
      opacity: 1,
    },
    hover: {
      width: 50,
      height: 50,
      backgroundColor: "rgba(16, 183, 127, 0.15)",
      borderColor: "var(--color-emerald)",
      borderWidth: 2,
    },
    card: {
      width: 70,
      height: 70,
      backgroundColor: "rgba(16, 183, 127, 0.05)",
      borderColor: "rgba(16, 183, 127, 0.3)",
      borderWidth: 1,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center border-0 border-solid will-change-transform"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={cursorType}
      variants={variants}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
    >
      {cursorType === "card" && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B77F]"
        >
          View
        </motion.span>
      )}
    </motion.div>
  );
};
