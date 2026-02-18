/* global process */
/**
 * Configuration utility to safely access environment variables.
 * This handles the difference between Vite's import.meta.env and Jest's environment.
 */

const getEnv = (key) => {
  // 1. Check import.meta.env (Vite environment - Static replacement friendly)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env[key]) return import.meta.env[key];
  }

  // 2. Fallback for Jest/Node or if Vite dynamic access fails
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  return undefined;
};

export const CLOUDINARY_CLOUD_NAME = getEnv("VITE_CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_UPLOAD_PRESET = getEnv("VITE_CLOUDINARY_UPLOAD_PRESET");
export const BACKEND_URL = getEnv("VITE_BACKEND_URL");
