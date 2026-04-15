import { memo, useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { SPRING, SHADOWS } from "../../constants/design-tokens";
import { Button } from "../ui";
import FavoriteButton from "../FavoriteButton";
import { useUpdateListingStatus } from "../../hooks/useListing";
import MarkAsSoldModal from "../MarkAsSoldModal";
import { useListingCandidates } from "../../hooks/useListing";
import CardCarousel from "./CardCarousel";
import ListingCardBadges from "./ListingCardBadges";

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
      whileHover={{ y: -8, shadow: SHADOWS.PREMIUM }}
      transition={SPRING.SNAPPY}
      className="listing-card group/card relative flex flex-col h-full bg-white dark:bg-[#10221C]/50 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-[#10B77F]/10 shadow-sm transition-all duration-500 hover:border-[#10B77F]/30"
    >
      {/* Image Section */}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <ListingCardBadges
          status={status}
          isFeatured={listing.isFeatured}
          condition={condition}
        />

        <div className="absolute top-4 right-4 z-20">
          <FavoriteButton listingId={_id} />
        </div>
      </div>

      {/* Content Section */}
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

        {isOwnerView && (
          <div className="flex gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-white/5 relative z-20">
            <Link to={`/listings/${_id}/edit`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Edit
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleStatusClick}
              isLoading={statusMutation.isPending}
            >
              {status === "sold" ? "Relist" : "Mark Sold"}
            </Button>
          </div>
        )}

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
