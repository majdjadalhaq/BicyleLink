/**
 * Jest-safe config that only uses process.env (no import.meta).
 * Used via moduleNameMapper when running tests.
 */
const getEnv = (key) => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

export { getEnv };
export const CLOUDINARY_CLOUD_NAME = getEnv("VITE_CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_UPLOAD_PRESET = getEnv("VITE_CLOUDINARY_UPLOAD_PRESET");
export const BACKEND_URL = getEnv("VITE_BACKEND_URL");
