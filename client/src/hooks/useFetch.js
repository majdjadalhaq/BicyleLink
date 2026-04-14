import { useState, useRef, useCallback } from "react";
import { apiClient } from "../services/apiClient";

/**
 * Modernized useFetch hook.
 * Now acts as a compatibility wrapper for the centralized apiClient.
 * Ensures backward compatibility while providing unified security and error handling.
 */
const useFetch = (route, onReceived, onError) => {
  const controllerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Strip /api if present for apiClient compatibility
  const actualRoute = route.startsWith("/api") ? route.replace("/api", "") : route;

  const cancelFetch = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const performFetch = useCallback(
    async (options = {}) => {
      setError(null);
      setIsLoading(true);

      // Create a fresh controller for cancellation
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      try {
        const data = await apiClient(actualRoute, { ...options, signal });
        
        if (onReceived) onReceived(data);
        return data;
      } catch (err) {
        // Ignore AbortError — it's an intentional cancellation
        if (err.name !== "AbortError") {
          const errorMessage = err.message || "Fetch failed";
          setError(errorMessage);
          if (onError) onError(err.data || { success: false, message: errorMessage });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [actualRoute, onReceived, onError],
  );

  return { isLoading, error, performFetch, cancelFetch };
};

export default useFetch;
