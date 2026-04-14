import { useState, useCallback } from "react";
import { apiClient } from "../services/apiClient";

/**
 * Compatibility hook for one-off API requests.
 * Now powered by the high-performance apiClient for unified error handling.
 */
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (endpoint, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure we don't double-prefix /api if it's already there
      const cleanEndpoint = endpoint.startsWith("/api") 
        ? endpoint.replace("/api", "") 
        : endpoint;

      const data = await apiClient(cleanEndpoint, options);
      return data;
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      return { success: false, message: errorMessage, ...err.data };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error };
};

export default useApi;
