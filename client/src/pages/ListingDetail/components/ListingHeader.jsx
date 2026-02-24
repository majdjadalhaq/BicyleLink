import PropTypes from "prop-types";

const ListingHeader = ({ listing, isOwner }) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        {listing.brand && (
          <span className="uppercase text-sm font-semibold text-emerald tracking-wide">
            {listing.brand}
          </span>
        )}
        {listing.status === "sold" && (
          <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Sold
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-white">
        {listing.title}
      </h1>

      {isOwner && (
        <div className="flex flex-wrap gap-5 bg-slate-50 dark:bg-dark-input px-4 py-3 rounded-xl mb-5 border border-slate-200 dark:border-dark-border w-fit">
          <div
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium"
            title="Unique views from potential buyers"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>{listing.views || 0} Views</span>
          </div>
          <div
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium"
            title="Unique buyers who messaged you"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>{listing.inquiries || 0} Inquiries</span>
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
