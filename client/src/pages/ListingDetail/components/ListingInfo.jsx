import { formatDistanceToNow } from "date-fns";
import PropTypes from "prop-types";

const ListingInfo = ({ listing, displayPrice }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Price Block */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
            €{displayPrice}
          </span>
        </div>

        {/* Condition pill */}
        {listing.condition && (
          <span className="mt-2 px-4 py-2 rounded-2xl text-xs font-black bg-emerald-800 dark:bg-emerald-600 text-white uppercase tracking-widest shadow-glow border border-emerald-400/20 flex-shrink-0">
            {listing.condition}
          </span>
        )}
      </div>

      {/* Posted time */}
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {formatDistanceToNow(new Date(listing.createdAt))} ago
      </p>
    </div>
  );
};

ListingInfo.propTypes = {
  listing: PropTypes.object.isRequired,
  displayPrice: PropTypes.string.isRequired,
};

export default ListingInfo;
