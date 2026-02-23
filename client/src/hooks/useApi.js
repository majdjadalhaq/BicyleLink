import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  const execute = useCallback(
    async (url, options = {}) => {
      setIsLoading(true);
      setError(null);

      // Add Authorization header if token exists
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            logout(); // Auto logout on unauthorized
          }
          throw new Error(data.message || "Something went wrong");
        }

        return data;
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [token, logout],
  );

  return { execute, isLoading, error };
};

export default useApi;
