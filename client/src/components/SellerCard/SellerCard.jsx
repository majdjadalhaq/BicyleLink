import StarRating from "../StarRating/StarRating";

/**
 * Seller information card displayed on a listing detail page.
 * Uses intent-based props so the parent computes business logic,
 * and this component stays purely presentational.
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
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5 mb-8">
      <h3 className="text-base font-semibold mb-3 text-slate-700 dark:text-slate-300">
        Seller Information
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {name || "Unknown Seller"}
          </span>

          {canViewReviews ? (
            <div
              className="flex items-center gap-2 cursor-pointer px-1 py-0.5 -ml-1 rounded transition-colors hover:bg-slate-100 dark:hover:bg-dark-input mt-0.5 group"
              onClick={onViewReviews}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onViewReviews()}
              title="Click to view all reviews"
            >
              <StarRating rating={averageRating} count={reviewCount} />
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic mt-0.5">
              No reviews yet
            </span>
          )}

          <span className="text-sm text-emerald mt-1 font-medium">
            Verified User
          </span>
        </div>
      </div>

      {canRate && (
        <button
          className="w-full mt-4 bg-yellow-400 text-yellow-900 border-none px-4 py-2.5 rounded-lg font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 hover:bg-yellow-500 shadow-sm"
          onClick={onRate}
        >
          ⭐ Rate Seller
        </button>
      )}

      {isSold && !canRate && (
        <span className="inline-block mt-4 text-xs font-bold uppercase bg-gray-100 text-gray-500 px-3 py-1 rounded">
          Sold Item
        </span>
      )}
    </div>
  );
};

export default SellerCard;
