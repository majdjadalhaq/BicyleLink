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
      className="star-rating"
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
            className="star-rating__star"
            aria-hidden="true"
            style={{ position: "relative", display: "inline-block" }}
          >
            {/* Background (empty) star */}
            <span style={{ color: "#ddd" }}>★</span>

            {/* Foreground (filled/partial) star */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                overflow: "hidden",
                width: filled ? "100%" : `${fillPercent}%`,
                color: "#f5a623",
              }}
            >
              ★
            </span>
          </span>
        );
      })}

      {count !== undefined && (
        <span className="star-rating__count">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
