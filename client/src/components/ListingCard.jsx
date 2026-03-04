import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import FavoriteButton from "./FavoriteButton";
import { optimiseCloudinaryUrl } from "../utils/cloudinary";
import useApi from "../hooks/useApi";
import useToast from "../hooks/useToast";
import MarkAsSoldModal from "./MarkAsSoldModal";

/* ─── Mini Image Carousel (inside card) ──────────────────────── */
const CardCarousel = ({ images, title }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  const imageUrls = images.map((img) =>
    optimiseCloudinaryUrl(img, { width: 600, height: 450, crop: "fill" }),
  );

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
  };

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === imageUrls.length - 1 ? 0 : i + 1));
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setIdx((i) => (i === imageUrls.length - 1 ? 0 : i + 1));
      else setIdx((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {imageUrls.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`${title} — photo ${i + 1}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />
      ))}

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70"
            aria-label="Previous photo"
            title="Previous photo"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70"
            aria-label="Next photo"
            title="Next photo"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {imageUrls.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`transition-all duration-200 rounded-full ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-[3px] rounded-full bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
            {idx + 1} / {imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

CardCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
};

/* ─── Listing Card ────────────────────────────────────────────── */
const ListingCard = ({
  listing,
  isOwnerView = false,
  onUpdated,
  onQuickView,
}) => {
  const { _id, title, images, location, condition } = listing;
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const deleteTimerRef = useRef(null);
  const { execute: executeApi } = useApi();
  const { showToast } = useToast();

  useEffect(() => {
    if (pendingDelete) {
      deleteTimerRef.current = setTimeout(() => setPendingDelete(false), 3000);
    }
    return () => clearTimeout(deleteTimerRef.current);
  }, [pendingDelete]);

  const hasImages = images && images.length > 0;
  const displayPrice = listing.price?.$numberDecimal || listing.price;

  const handleDelete = useCallback(
    async (e) => {
      e.preventDefault();
      if (!pendingDelete) {
        setPendingDelete(true);
        return;
      }
      setPendingDelete(false);
      const data = await executeApi(`/api/listings/${_id}`, {
        method: "DELETE",
      });
      if (data?.success !== false) onUpdated?.();
      else showToast("Failed to delete listing", "error");
    },
    [pendingDelete, _id, executeApi, onUpdated, showToast],
  );

  const handleStatusUpdate = useCallback(
    async (newStatus) => {
      setIsUpdating(true);
      const buyerId =
        newStatus === "sold" && selectedBuyerId !== "other"
          ? selectedBuyerId
          : null;

      const data = await executeApi(`/api/listings/${_id}/status`, {
        method: "PATCH",
        body: { status: newStatus, ...(buyerId ? { buyerId } : {}) },
      });
      setIsUpdating(false);
      if (data?.success) {
        setStatusModalOpen(false);
        onUpdated?.();
      } else {
        showToast("Failed to update status", "error");
      }
    },
    [_id, executeApi, onUpdated, showToast, selectedBuyerId],
  );

  const handleStatusClick = useCallback(
    (e) => {
      e.preventDefault();
      if (listing.status === "active") {
        setStatusModalOpen(true);
        // Fetch candidates immediately
        const fetchCandidates = async () => {
          setIsLoadingCandidates(true);
          const data = await executeApi(`/api/listings/${_id}/candidates`);
          if (data?.success) {
            setCandidates(data.result);
          }
          setIsLoadingCandidates(false);
        };
        fetchCandidates();
      } else {
        handleStatusUpdate("active");
      }
    },
    [listing.status, _id, executeApi, handleStatusUpdate],
  );

  return (
    <div
      className="listing-card group relative flex flex-col h-full bg-white dark:bg-[#10221C]/50 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-[#10B77F]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 hover:shadow-glow hover:border-[#10B77F]/20 hover:-translate-y-1.5"
      data-id={_id}
    >
      {/* ── Image Section ── */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
        {hasImages ? (
          <CardCarousel images={images} title={title} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#161616] border border-dashed border-[#2a2a2a]">
            <svg
              width="36"
              height="36"
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
            <span className="text-xs text-gray-600 font-medium">No photos</span>
          </div>
        )}

        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {listing.status === "sold" && (
            <div className="w-fit px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-black text-white bg-red-500/90 backdrop-blur-md uppercase tracking-widest flex items-center gap-1 border border-white/20 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Sold Out
            </div>
          )}
          {listing.isFeatured && (
            <div className="w-fit px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-black text-white bg-amber-500/90 backdrop-blur-md uppercase tracking-widest flex items-center gap-1 border border-white/20 shadow-lg">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </div>
          )}
          {condition && (
            <div className="w-fit px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black text-white bg-[#10B77F]/90 backdrop-blur-md uppercase tracking-[0.15em] border border-white/20 shadow-glow">
              {condition}
            </div>
          )}
        </div>

        {/* Fav Button */}
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton listingId={_id} />
        </div>

        {/* Quick View button — desktop only */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView?.(listing);
          }}
          className="hidden md:flex absolute bottom-0 left-0 right-0 z-20 py-2.5 items-center justify-center gap-2 bg-black/65 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
          aria-label="Quick view listing"
          title="Quick view"
        >
          <svg
            width="13"
            height="13"
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
          Quick View
        </button>
      </div>

      {/* ── Content Section ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Row 1: Title */}
        <h3 className="text-[17px] font-black text-gray-900 dark:text-white leading-snug tracking-tight line-clamp-2 group-hover:text-[#10B77F] transition-colors duration-300 mb-2">
          {title}
        </h3>

        {/* Row 2: Price + Location on same line */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
            €{displayPrice}
          </span>
          {location && (
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium min-w-0 overflow-hidden">
              <svg
                width="11"
                height="11"
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
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Row 3: Stats + seller muted row */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 dark:border-white/5 pt-3 mt-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg
                width="9"
                height="9"
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
              {listing.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <svg
                width="9"
                height="9"
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
              {listing.inquiries || 0}
            </span>
          </div>
          {listing.ownerId?.name && (
            <span className="truncate font-medium text-gray-500 dark:text-gray-500">
              {listing.ownerId.name}
            </span>
          )}
        </div>

        {/* Owner Actions */}
        {isOwnerView && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Link
              to={`/listings/${_id}/edit`}
              className="flex-1 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-[#10B77F] hover:bg-[#10B77F]/5 dark:hover:bg-[#10B77F]/10 transition-all border border-transparent hover:border-[#10B77F]/30"
              title="Edit Listing"
              aria-label="Edit Listing"
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <button
              onClick={handleStatusClick}
              disabled={isUpdating}
              className="flex-1 h-9 flex items-center justify-center rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-[#10B77F] text-white shadow-lg shadow-[#10B77F]/20 hover:bg-[#0EA572]"
              title={listing.status === "sold" ? "Relist Item" : "Mark as Sold"}
              aria-label={
                listing.status === "sold" ? "Relist Item" : "Mark as Sold"
              }
            >
              {listing.status === "sold" ? "Relist" : "Sold"}
            </button>
            <button
              onClick={handleDelete}
              className={`flex-1 h-9 flex items-center justify-center rounded-xl transition-all ${pendingDelete ? "bg-amber-500 text-white animate-pulse" : "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"}`}
              title={pendingDelete ? "Confirm Deletion" : "Delete Listing"}
              aria-label={pendingDelete ? "Confirm Deletion" : "Delete Listing"}
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
                {pendingDelete ? (
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                ) : (
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                )}
              </svg>
            </button>
          </div>
        )}

        {/* Full-card click (non-owner) */}
        {!isOwnerView && (
          <Link
            to={`/listings/${_id}`}
            className="absolute inset-0 z-0"
            aria-label={`View details for ${title}`}
          />
        )}
      </div>
      {/* Buyer Selection Modal */}
      {isOwnerView && (
        <MarkAsSoldModal
          isOpen={statusModalOpen}
          candidates={candidates}
          isLoading={isLoadingCandidates}
          selectedBuyerId={selectedBuyerId}
          onBuyerChange={setSelectedBuyerId}
          onConfirm={() => handleStatusUpdate("sold")}
          onClose={() => setStatusModalOpen(false)}
        />
      )}
    </div>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string.isRequired,
    condition: PropTypes.string,
    brand: PropTypes.string,
    ownerId: PropTypes.object,
    status: PropTypes.string,
    views: PropTypes.number,
    inquiries: PropTypes.number,
    isFeatured: PropTypes.bool,
  }).isRequired,
  isOwnerView: PropTypes.bool,
  onUpdated: PropTypes.func,
  onQuickView: PropTypes.func,
};

export default memo(ListingCard);
