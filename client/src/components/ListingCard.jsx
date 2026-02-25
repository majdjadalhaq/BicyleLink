import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import FavoriteButton from "./FavoriteButton";
import { optimiseCloudinaryUrl } from "../utils/cloudinary";
import useApi from "../hooks/useApi";
import useToast from "../hooks/useToast";

const ListingCard = ({ listing, isOwnerView = false, onUpdated }) => {
  const { _id, title, images, location, condition, brand } = listing;
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const deleteTimerRef = useRef(null);
  const { execute: executeApi } = useApi();
  const { showToast } = useToast();

  useEffect(() => {
    if (pendingDelete) {
      deleteTimerRef.current = setTimeout(() => setPendingDelete(false), 3000);
    }
    return () => clearTimeout(deleteTimerRef.current);
  }, [pendingDelete]);

  const rawImageUrl =
    images && images.length > 0
      ? images[0]
      : "https://placehold.co/600x400?text=No+Image";

  const imageUrl = optimiseCloudinaryUrl(rawImageUrl, {
    width: 500,
    height: 400,
    crop: "fill",
  });

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

      if (data?.success !== false) {
        onUpdated?.();
      } else {
        showToast("Failed to delete listing", "error");
      }
    },
    [pendingDelete, _id, executeApi, onUpdated, showToast],
  );

  const handleStatusToggle = useCallback(
    async (e) => {
      e.preventDefault();
      setIsUpdating(true);
      const newStatus = listing.status === "active" ? "sold" : "active";

      const data = await executeApi(`/api/listings/${_id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });

      setIsUpdating(false);

      if (data?.success) {
        onUpdated?.();
      } else {
        showToast("Failed to update status", "error");
      }
    },
    [listing.status, _id, executeApi, onUpdated, showToast],
  );

  return (
    <div
      className="listing-card flex flex-col h-full bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 dark:border-dark-border group"
      data-id={_id}
    >
      <div className="relative w-full pt-[66.67%] bg-gray-100 dark:bg-dark-bg overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton listingId={_id} />
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {listing.status === "sold" && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md w-fit bg-red-600">
              SOLD
            </span>
          )}
          {listing.isFeatured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md w-fit bg-gradient-to-br from-amber-500 to-amber-600 border border-white/20 uppercase tracking-wider">
              ★ FEATURED
            </span>
          )}
          {condition && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md w-fit bg-emerald-500 dark:bg-emerald-600 capitalize">
              {condition}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow text-left">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1.5">
            {brand && (
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider truncate mr-2">
                {brand}
              </span>
            )}
            {listing.ownerId?.name && (
              <span className="text-[11px] italic text-gray-500 dark:text-gray-400 truncate">
                by {listing.ownerId.name}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
            {title}
          </h3>
        </div>

        <div className="text-xl font-extrabold text-emerald-500 mb-3">
          €{displayPrice}
        </div>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1.5 truncate">
            <span aria-hidden="true">📍</span> {location}
          </span>
          {listing.ownerId?.averageRating > 0 && (
            <span
              className="flex items-center gap-1 text-[13px] font-semibold text-gray-700 dark:text-gray-300 ml-auto flex-shrink-0"
              title={`${listing.ownerId.reviewCount} reviews`}
            >
              <span className="text-amber-400">★</span>
              {listing.ownerId.averageRating}
            </span>
          )}
        </div>

        <div className="flex gap-3 py-3 mt-3 mb-3 border-t border-dotted border-gray-200 dark:border-dark-border">
          <span
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg px-2.5 py-1 rounded-full border border-gray-100 dark:border-dark-border"
            title="Total views"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {listing.views || 0}
          </span>
          <span
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg px-2.5 py-1 rounded-full border border-gray-100 dark:border-dark-border"
            title="Inquiries from potential buyers"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {listing.inquiries || 0}
          </span>
        </div>

        {isOwnerView ? (
          <div className="flex gap-2.5 mt-auto text-sm">
            <Link
              to={`/listings/${_id}/edit`}
              className="flex-1 py-2 px-2 text-center font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-input dark:text-gray-300 dark:hover:bg-dark-border transition-colors"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={handleStatusToggle}
              className={`flex-1 py-2 px-2 text-center font-semibold rounded-lg text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${listing.status === "sold" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
              disabled={isUpdating}
            >
              {listing.status === "sold" ? "🔄 Reactivate" : "🤝 Sold"}
            </button>
            <button
              onClick={handleDelete}
              className={`flex-1 py-2 px-2 text-center font-semibold rounded-lg transition-colors ${pendingDelete ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 animate-pulse" : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"}`}
            >
              {pendingDelete ? "⚠️ Confirm?" : "🗑️ Delete"}
            </button>
          </div>
        ) : (
          <Link
            to={`/listings/${_id}`}
            className="mt-auto block w-full py-2.5 text-center font-bold text-emerald-500 border-2 border-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
          >
            View Details
          </Link>
        )}
      </div>
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
};

export default memo(ListingCard);
