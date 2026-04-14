import { BACKEND_URL } from "../utils/config.js";

const BASE_URL = BACKEND_URL || "";

/**
 * Modernized API Client for BiCycleL.
 * Handles authentication, standard error shaping, and real-time auth events.
 */
const apiClient = async (endpoint, options = {}) => {
  // Fix: Ensure we don't double-prefix /api/
  const cleanEndpoint = endpoint.startsWith("/api") 
    ? endpoint 
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
  const url = `${BASE_URL}${cleanEndpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  if (options.body && typeof options.body === "object") {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      const errorMessage = 
        data?.message || 
        data?.msg || 
        data?.errors?.[0]?.message || 
        `Error: ${response.status} ${response.statusText}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error("Network error: Please check your internet connection.");
    }
    throw err;
  }
};

// Convenience methods
apiClient.get = (e, o) => apiClient(e, { ...o, method: "GET" });
apiClient.post = (e, b, o) => apiClient(e, { ...o, method: "POST", body: b });
apiClient.put = (e, b, o) => apiClient(e, { ...o, method: "PUT", body: b });
apiClient.patch = (e, b, o) => apiClient(e, { ...o, method: "PATCH", body: b });
apiClient.delete = (e, o) => apiClient(e, { ...o, method: "DELETE" });

// Restore compatibility for legacy hooks
export const fetcher = apiClient; 
export { apiClient };
export default apiClient;
