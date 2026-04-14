import { BACKEND_URL } from "../utils/config.js";

const BASE_URL = BACKEND_URL || "";

/**
 * Standard fetcher for TanStack Query
 * @param {string} endpoint - The API endpoint to fetch (e.g., "/listings")
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
export const fetcher = async (endpoint, options = {}) => {
  const url = `${BASE_URL}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.msg || data.errors?.[0]?.message || `Error: ${response.status}`,
    );
  }

  if (data.success === false) {
    throw new Error(data.msg || "Request failed");
  }

  return data;
};
