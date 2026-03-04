import PropTypes from "prop-types";

const ChatHeader = ({ onBack, listing, isOnline }) => {
  let displayPrice = listing?.price;
  if (listing?.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface flex-shrink-0">
      <button
        className="btn-icon text-gray-500 dark:text-gray-400 hover:text-emerald-500"
        onClick={onBack}
        aria-label="Back to inbox"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
          {listing?.title || "Chat"}
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOnline ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-gray-400"}`}
          ></span>
        </h2>
        {displayPrice && (
          <span className="text-sm font-semibold text-emerald-500">
            €{displayPrice}
          </span>
        )}
      </div>
    </header>
  );
};

ChatHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  listing: PropTypes.object,
  isOnline: PropTypes.bool.isRequired,
};

export default ChatHeader;
