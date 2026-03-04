import { useState, useCallback } from "react";
import ToastContainer from "../components/ToastContainer";

let _idCounter = 0;

/**
 * Hook that provides showToast and ToastContainer.
 * Mount <ToastContainer /> somewhere in the component tree.
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++_idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const BoundContainer = useCallback(
    () => <ToastContainer toasts={toasts} onDismiss={dismiss} />,
    [toasts, dismiss],
  );

  return { showToast, ToastContainer: BoundContainer };
};

export default useToast;
