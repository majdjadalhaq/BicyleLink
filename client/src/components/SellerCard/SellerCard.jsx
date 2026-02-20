import StarRating from "../StarRating/StarRating";

/**
 * Seller information card displayed on a listing detail page.
 * Uses intent-based props so the parent computes business logic,
 * and this component stays purely presentational.
 *
 * @param {object} props
 * @param {{ name: string, averageRating: number, reviewCount: number }} props.seller
 * @param {boolean} props.canRate     - True when buyer can rate this seller.
 * @param {boolean} props.canViewReviews - True when the seller has reviews to show.
 * @param {boolean} props.isSold      - True when the listing is sold.
 * @param {function} props.onRate     - Called when user clicks "Rate Seller".
 * @param {function} props.onViewReviews - Called when user clicks the rating display.
 */
const SellerCard = ({
  seller,
  canRate,
  canViewReviews,
  isSold,
  onRate,
  onViewReviews,
}) => {
  const { name, averageRating, reviewCount } = seller;
  const initial = name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="seller-info-section">
      <h3 className="seller-info-title">Seller Information</h3>
      <div className="seller-card">
        <div className="seller-avatar">{initial}</div>
        <div className="seller-details">
          <span className="seller-name">{name || "Unknown Seller"}</span>

          {canViewReviews ? (
            <div
              className="seller-rating-display"
              onClick={onViewReviews}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onViewReviews()}
              title="Click to view all reviews"
            >
              <StarRating rating={averageRating} count={reviewCount} />
            </div>
          ) : (
            <span className="seller-no-reviews">No reviews yet</span>
          )}

          <span className="seller-email">Verified User</span>
        </div>
      </div>

      {canRate && (
        <button className="btn-rate-seller" onClick={onRate}>
          ⭐ Rate Seller
        </button>
      )}

      {isSold && !canRate && (
        <span className="seller-sold-badge">Sold Item</span>
      )}
    </div>
  );
};

export default SellerCard;
