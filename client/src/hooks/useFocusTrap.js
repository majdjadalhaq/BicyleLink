import { useEffect, useRef, useCallback } from "react";

/**
 * Traps focus within a container element. Used for modals.
 * @param {boolean} isActive - Whether the trap is active
 * @param {React.RefObject} containerRef - Ref to the container element
 * @param {Object} options - Options
 * @param {boolean} options.restoreFocus - Whether to restore focus to previously focused element on deactivate (default: true)
 */
export function useFocusTrap(isActive, containerRef, options = {}) {
  const { restoreFocus = true } = options;
  const previouslyFocusedRef = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef?.current) return [];
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(containerRef.current.querySelectorAll(selector)).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.getAttribute("tabindex") !== "-1" &&
        el.offsetParent !== null,
    );
  }, [containerRef]);

  useEffect(() => {
    if (!isActive || !containerRef?.current) return;

    previouslyFocusedRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (restoreFocus && previouslyFocusedRef.current?.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isActive, containerRef, getFocusableElements, restoreFocus]);
}

export default useFocusTrap;
