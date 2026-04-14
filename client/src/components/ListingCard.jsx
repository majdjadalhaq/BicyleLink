import { memo, useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import FavoriteButton from "./FavoriteButton";
import { optimiseCloudinaryUrl } from "../utils/cloudinary";
import { useUpdateListingStatus } from "../hooks/useListing";
import MarkAsSoldModal from "./MarkAsSoldModal";
import { useListingCandidates } from "../hooks/useListing";

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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${i === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}
        />
      ))}

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:bg-emerald-500"
            aria-label="Previous photo"
          >
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:bg-emerald-500"
            aria-label="Next photo"
          >
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            {imageUrls.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-500 rounded-full h-1 ${i === idx ? "w-4 bg-white" : "w-1 bg-white/40"}`}
              />
            ))}
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
const ListingCard = ({ listing, isOwnerView = false, onUpdated }) => {
  const { _id, title, images, location, condition, status } = listing;
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const deleteTimerRef = useRef(null);

  const { data: candidates = [], isLoading: isLoadingCandidates } =
    useListingCandidates(_id, statusModalOpen);
  const statusMutation = useUpdateListingStatus(_id);

  useEffect(() => {
    if (pendingDelete) {
      deleteTimerRef.current = setTimeout(() => setPendingDelete(false), 3000);
    }
    return () => clearTimeout(deleteTimerRef.current);
  }, [pendingDelete]);

  const hasImages = images && images.length > 0;
  const displayPrice = listing.price?.$numberDecimal || listing.price;

  const handleStatusUpdate = (newStatus) => {
    const buyerId =
      newStatus === "sold" && selectedBuyerId !== "other"
        ? selectedBuyerId
        : null;
    statusMutation.mutate(
      { status: newStatus, buyerId },
      {
        onSuccess: () => {
          setStatusModalOpen(false);
          onUpdated?.();
        },
      },
    );
  };

  const handleStatusClick = (e) => {
    e.preventDefault();
    if (status === "active") {
      setStatusModalOpen(true);
    } else {
      handleStatusUpdate("active");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="listing-card group/card relative flex flex-col h-full bg-white dark:bg-[#10221C]/50 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-[#10B77F]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 hover:shadow-glow hover:border-[#10B77F]/30"
    >
      {/* ── Image Section ── */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
        {hasImages ? (
          <CardCarousel images={images} title={title} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#161616]">
            <span className="text-xs text-gray-600 font-bold uppercase tracking-widest">
              No photos
            </span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Dynamic Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {status === "sold" && (
            <div className="px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-red-500/80 backdrop-blur-md uppercase tracking-widest flex items-center gap-1.5 border border-white/20 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Sold
            </div>
          )}
          {listing.isFeatured && (
            <div className="px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-amber-500/80 backdrop-blur-md uppercase tracking-widest flex items-center gap-1.5 border border-white/20 shadow-lg">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </div>
          )}
          {condition && (
            <div className="px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-[#10B77F]/80 backdrop-blur-md uppercase tracking-[0.15em] border border-white/20 shadow-glow">
              {condition}
            </div>
          )}
        </div>

        {/* Favorite Button (floating) */}
        <div className="absolute top-4 right-4 z-20">
          <FavoriteButton listingId={_id} />
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight tracking-tight line-clamp-2 group-hover/card:text-[#10B77F] transition-colors duration-300 mb-2">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
            €{displayPrice}
          </span>
          {location && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[120px]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#10B77F] flex-shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4 mt-auto">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#10B77F]"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {listing.views || 0}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#10B77F]"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {listing.inquiries || 0}
            </div>
          </div>
          {listing.ownerId?.name && (
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
              {listing.ownerId.name}
            </span>
          )}
        </div>

        {/* Owner Controls */}
        {isOwnerView && (
          <div className="flex gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-white/5 relative z-20">
            <Link
              to={`/listings/${_id}/edit`}
              className="flex-1 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-[#10B77F] hover:bg-[#10B77F]/5 transition-all border border-transparent hover:border-[#10B77F]/20"
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
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <button
              onClick={handleStatusClick}
              disabled={statusMutation.isPending}
              className="flex-1 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-[#10B77F] text-white shadow-lg shadow-[#10B77F]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {status === "sold" ? "Relist" : "Mark Sold"}
            </button>
          </div>
        )}

        {/* Link overlay */}
        <Link to={`/listings/${_id}`} className="absolute inset-0 z-10" />
      </div>

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
    </motion.div>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.object.isRequired,
  isOwnerView: PropTypes.bool,
  onUpdated: PropTypes.func,
};

export default memo(ListingCard);
