import PropTypes from "prop-types";

/**
 * Reusable star rating display component.
 */
const StarRating = ({ rating = 0, count }) => {
  const clampedRating = Math.min(5, Math.max(0, rating));

  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`Rating: ${Number(clampedRating || 0).toFixed(1)} out of 5`}
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
            className="relative inline-block w-4 h-4"
            aria-hidden="true"
          >
            {/* Background (empty) star */}
            <svg
              className="text-gray-300 dark:text-gray-600 w-full h-full"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>

            {/* Foreground (filled/partial) star */}
            <div
              className="absolute top-0 left-0 overflow-hidden text-amber-400 h-full"
              style={{
                width: filled ? "100%" : `${fillPercent}%`,
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
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

StarRating.propTypes = {
  rating: PropTypes.number,
  count: PropTypes.number,
};

export default StarRating;
