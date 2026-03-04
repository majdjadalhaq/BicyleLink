import { useEffect, useCallback } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";

/* ─── Quick View Drawer ─────────────────────────────────────── */
const QuickViewDrawer = ({ listing, onClose }) => {
  const isOpen = !!listing;

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!listing) return null;

  const {
    _id,
    title,
    images,
    price,
    location,
    condition,
    category,
    description,
  } = listing;
  const displayPrice = price?.$numberDecimal ?? price;
  const imageUrl = images?.[0] ?? null;
  const sellerName = listing.ownerId?.name;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-[201] h-full w-full max-w-md bg-white dark:bg-[#141414] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${title}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
            Quick View
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            aria-label="Close quick view"
            title="Close"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero image */}
          <div className="relative w-full aspect-[4/3] bg-[#0f0f0f] overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
                  <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
                  <path d="M12 6V3" />
                </svg>
                <span className="text-xs text-gray-600">No photos</span>
              </div>
            )}

            {/* Image count */}
            {images?.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
                {images.length} photos
              </div>
            )}

            {/* Status badge */}
            {listing.status === "sold" && (
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-red-500/90 backdrop-blur-md uppercase tracking-widest flex items-center gap-1 border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Sold Out
              </div>
            )}
            {condition && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black text-white bg-emerald-800/80 dark:bg-emerald-600/80 backdrop-blur-md uppercase tracking-widest border border-white/20 shadow-glow">
                {condition}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images?.length > 1 && (
            <div className="flex gap-2 px-5 pt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="w-14 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all"
                >
                  <img
                    src={img}
                    alt={`${title} ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Title + price */}
            <div>
              {category && (
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                  {category}
                </p>
              )}
              <h2 className="text-xl font-black text-gray-900 dark:text-white leading-snug mb-2">
                {title}
              </h2>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  €{displayPrice}
                </span>
                {location && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-500"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {location}
                  </div>
                )}
              </div>
            </div>

            {/* Seller row */}
            {sellerName && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {sellerName}
                  </p>
                </div>
              </div>
            )}

            {/* Description preview */}
            {description && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Description
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-white/5 flex gap-3 flex-shrink-0 bg-white dark:bg-[#141414]">
          <Link
            to={`/listings/${_id}`}
            onClick={onClose}
            className="flex-1 py-3 bg-emerald-800 dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-glow"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View Full Listing
          </Link>
          {listing.status !== "sold" && (
            <Link
              to={`/inbox?listing=${_id}`}
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all border border-gray-200 dark:border-white/10"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Message Seller
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

QuickViewDrawer.propTypes = {
  listing: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default QuickViewDrawer;
