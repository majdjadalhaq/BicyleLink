import { formatDistanceToNow } from "date-fns";
import PropTypes from "prop-types";

const ListingInfo = ({ listing, displayPrice }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          €{displayPrice}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 italic">
          Posted {formatDistanceToNow(new Date(listing.createdAt))} ago
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {listing.condition && (
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-emerald text-white">
            {listing.condition}
          </span>
        )}
        {listing.location && (
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-dark-input text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            {listing.location}
          </span>
        )}
      </div>
    </>
  );
};

ListingInfo.propTypes = {
  listing: PropTypes.object.isRequired,
  displayPrice: PropTypes.string.isRequired,
};

export default ListingInfo;
