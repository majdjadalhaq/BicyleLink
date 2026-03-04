import { useState, useCallback } from "react";
import api from "../services/api";

const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // api.js automatically prepends /api internally, but if the caller manually passes
      // /api/... we let api.js handle it (api.js actually just prepends /api blindly right now)
      // Wait, let's strip '/api' if passed, so it routes correctly.
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
