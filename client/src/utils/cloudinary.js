/**
 * Optimises a Cloudinary image URL by injecting transformation params.
 *
 * - Only transforms res.cloudinary.com URLs — all other URLs pass through unchanged.
 * - Idempotent: will not double-transform if params are already present.
 *
 * @param {string} url - The original image URL.
 * @param {object} [options] - Optional transform overrides.
 * @param {number} [options.width] - Desired width in pixels.
 * @param {number} [options.height] - Desired height in pixels.
 * @param {string} [options.crop] - Cloudinary crop mode (default: "fill").
 * @returns {string} The optimised URL, or the original if not a Cloudinary URL.
 */
export const optimiseCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // Idempotency guard: skip if transformation params are already present
  if (
    url.includes("/upload/f_auto") ||
    url.includes("/upload/w_") ||
    url.includes("/upload/q_auto")
  ) {
    return url;
  }

  const { width, height, crop = "fill" } = options;

  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width && height) transforms.push(`c_${crop}`);

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
};
