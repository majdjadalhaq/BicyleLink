import { useState, useEffect } from "react";

/**
 * Custom hook to detect if a soft keyboard is likely open on mobile devices.
 * It listens to focus events on inputs and textareas.
 */
export default function useKeyboardFocus() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exclude input types that typically don't trigger the virtual keyboard
        if (
          [
            "checkbox",
            "radio",
            "button",
            "submit",
            "color",
            "file",
            "image",
            "reset",
          ].includes(target.type)
        ) {
          return;
        }
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return isKeyboardOpen;
}
