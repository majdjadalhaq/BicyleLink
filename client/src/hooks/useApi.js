import { useState, useCallback } from "react";

/**
 * Imperative mutation hook for POST, PUT, PATCH, and DELETE requests.
 *
 * Usage:
 *   const { execute, data, isLoading, error, reset } = useApi();
 *   await execute("/api/reviews", { method: "POST", body: { rating: 5 } });
 *
 * - `execute` is stable across renders (wrapped in useCallback) — safe to pass
 *   to React.memo components without triggering unnecessary re-renders.
 * - Body is automatically JSON.stringify'd — pass a plain object.
 * - Returns a Promise so callers can await the result.
 * - Handles 204 No Content responses without calling .json().
 */
const useApi = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        credentials: "include",
      });

      // 204 No Content — no body to parse
      if (response.status === 204) {
        setData(null);
        setIsLoading(false);
        return { success: true };
      }

      const result = await response.json();

      if (!response.ok) {
        const errorMsg =
          result?.msg || result?.errors?.[0]?.message || "Request failed";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      setData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMsg = err.message || "Network error";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { execute, data, isLoading, error, reset };
};

export default useApi;
