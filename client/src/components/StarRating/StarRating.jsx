/**
 * Reusable star rating display component.
 *
 * @param {object} props
 * @param {number} props.rating - Average rating value (0–5).
 * @param {number} [props.count] - Total number of reviews to display alongside stars.
 */
const StarRating = ({ rating = 0, count }) => {
  const clampedRating = Math.min(5, Math.max(0, rating));

  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`Rating: ${clampedRating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = clampedRating >= star;
        const partial = !filled && clampedRating > star - 1;
        const fillPercent = partial
          ? Math.round((clampedRating - (star - 1)) * 100)
          : 0;

        return (
          <span
            key={star}
            className="relative inline-block text-base"
            aria-hidden="true"
          >
            {/* Background (empty) star */}
            <span className="text-gray-300 dark:text-gray-600">★</span>

            {/* Foreground (filled/partial) star */}
            <span
              className="absolute top-0 left-0 overflow-hidden text-amber-400"
              style={{
                width: filled ? "100%" : `${fillPercent}%`,
              }}
            >
              ★
            </span>
          </span>
        );
      })}

      {count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-medium">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
