import PropTypes from "prop-types";

const ListingHeader = ({ listing, isOwner }) => {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-gray-900 dark:text-white">
        {listing.title}
      </h1>

      {/* Location */}
      {listing.location && (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#10B77F] flex-shrink-0"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm font-semibold">{listing.location}</span>
        </div>
      )}

      {/* Owner Analytics Strip */}
      {isOwner && (
        <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 w-fit">
          <div
            className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400"
            title="Views from potential buyers"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#10B77F]"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-gray-900 dark:text-white font-black">
              {listing.views || 0}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Views
            </span>
          </div>
          <div className="w-px h-5 bg-gray-200 dark:bg-white/10" />
          <div
            className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400"
            title="Buyers who contacted you"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#10B77F]"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span className="text-gray-900 dark:text-white font-black">
              {listing.inquiries || 0}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Inquiries
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ListingHeader.propTypes = {
  listing: PropTypes.object.isRequired,
  isOwner: PropTypes.bool,
};

export default ListingHeader;
