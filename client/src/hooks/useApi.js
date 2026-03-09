import { useState, useCallback } from "react";
import api from "../services/api";

const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // api.js prepends /api internally, so strip it from the url if the caller
      // already included it to avoid ending up with /api/api/users.
      let parsedUrl = url;
      if (url.startsWith("/api")) {
        parsedUrl = url.substring(4);
      }

      const data = await api.request(parsedUrl, options);
      return data;
    } catch (err) {
      setError(err.message);
      return err.data || { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error };
};

export default useApi;
