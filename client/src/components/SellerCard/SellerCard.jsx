import StarRating from "../StarRating/StarRating";
import PropTypes from "prop-types";

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
  onViewProfile,
}) => {
  const { name, averageRating, reviewCount, avatarUrl } = seller;
  const initial = name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 mb-8 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20 border-4 border-white dark:border-[#1a1a1a] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-[#2a2a2a] rounded-lg shadow-md flex items-center justify-center border border-gray-100 dark:border-white/10">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-black text-gray-900 dark:text-white truncate mb-1">
            {name || "Unknown Seller"}
          </h4>

          {canViewReviews ? (
            <div
              className="flex flex-col gap-1 cursor-pointer group/rating"
              onClick={onViewReviews}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onViewReviews()}
              title="Click to view all reviews"
            >
              <StarRating rating={averageRating} count={reviewCount} />
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight group-hover/rating:text-emerald-500 transition-colors">
                View Reviews
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic font-medium">
              New across the platform
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {canRate && (
          <button
            className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
            onClick={onRate}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="group-hover/btn:scale-125 transition-transform"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Submit Feedback
          </button>
        )}

        <button
          className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/profile"
          onClick={onViewProfile}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover/profile:scale-110 transition-transform"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          View Profile
        </button>

        {isSold && !canRate && (
          <div className="w-full py-3 px-4 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Transaction Complete
          </div>
        )}
      </div>
    </div>
  );
};

SellerCard.propTypes = {
  seller: PropTypes.shape({
    name: PropTypes.string,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    avatarUrl: PropTypes.string,
  }).isRequired,
  canRate: PropTypes.bool,
  canViewReviews: PropTypes.bool,
  isSold: PropTypes.bool,
  onRate: PropTypes.func,
  onViewReviews: PropTypes.func,
  onViewProfile: PropTypes.func,
};

export default SellerCard;
