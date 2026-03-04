/**
 * Centralized API Service
 * Handles all network requests to the backend.
 * Uses native fetch. Auth tokens are handled by httpOnly cookies via credentials: "include".
 */

const BASE_URL = "/api";

export const api = {
  /**
   * Universal fetch wrapper
   * @param {string} endpoint - The API route (e.g., '/users/me')
   * @param {object} options - Fetch options (method, body, headers, etc)
   */
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: "include", // Essential for HttpOnly cookies
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        // Trigger a global event or callback for logout if needed
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      throw new Error(
        data?.message ||
          data?.msg ||
          data?.errors?.[0]?.message ||
          `API Error: ${response.status} ${response.statusText}`,
      );
    }

    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default api;
