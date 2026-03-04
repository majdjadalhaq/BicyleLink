/**
 * Formats a date string or Date object into a readable time string.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted time string (e.g., "14:30").
 */
export const toTimeString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
