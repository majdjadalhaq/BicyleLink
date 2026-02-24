import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/ListingCard.css";
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

  // Auto-reset pendingDelete after 3 seconds
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

      // Second click — actually delete
      setPendingDelete(false);
      const data = await executeApi(`/api/listings/${_id}`, {
        method: "DELETE",
      });

      if (data?.success !== false) {
        onUpdated?.(); // Notify parent to refresh list — no reload needed
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
        onUpdated?.(); // Notify parent — no reload needed
      } else {
        showToast("Failed to update status", "error");
      }
    },
    [listing.status, _id, executeApi, onUpdated, showToast],
  );

  return (
    <div className="listing-card" data-id={_id}>
      <div className="listing-card__image-container">
        <img src={imageUrl} alt={title} className="listing-card__image" />

        <FavoriteButton listingId={_id} />

        <div className="listing-card__badges">
          {listing.status === "sold" && (
            <span className="listing-card__badge listing-card__badge--sold">
              SOLD
            </span>
          )}
          {listing.isFeatured && (
            <span className="listing-card__badge listing-card__badge--featured">
              ★ FEATURED
            </span>
          )}
          {condition && (
            <span className="listing-card__badge">{condition}</span>
          )}
        </div>
      </div>

      <div className="listing-card__content">
        <div className="listing-card__header">
          <div className="listing-card__meta">
            {brand && <span className="listing-card__brand">{brand}</span>}
            {listing.ownerId?.name && (
              <span className="listing-card__seller">
                by {listing.ownerId.name}
              </span>
            )}
          </div>
          <h3 className="listing-card__title">{title}</h3>
        </div>

        <div className="listing-card__price">€{displayPrice}</div>

        <div className="listing-card__details">
          <span className="listing-card__location">
            <span aria-hidden="true">📍</span> {location}
          </span>
          {listing.ownerId?.averageRating > 0 && (
            <span
              className="listing-card__rating"
              title={`${listing.ownerId.reviewCount} reviews`}
            >
              <span className="star-icon">★</span>
              {listing.ownerId.averageRating}
            </span>
          )}
        </div>

        <div className="listing-card__analytics">
          <span className="analytics-pill" title="Total views">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {listing.views || 0}
          </span>
          <span
            className="analytics-pill"
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
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {listing.inquiries || 0}
          </span>
        </div>

        {isOwnerView ? (
          <div className="listing-card__actions">
            <Link to={`/listings/${_id}/edit`} className="btn-edit-card">
              ✏️ Edit
            </Link>
            <button
              onClick={handleStatusToggle}
              className={`btn-status-card ${listing.status === "sold" ? "btn-reactivate" : "btn-sold"}`}
              disabled={isUpdating}
            >
              {listing.status === "sold" ? "🔄 Reactivate" : "🤝 Sold"}
            </button>
            <button
              onClick={handleDelete}
              className={`btn-delete-card${pendingDelete ? " btn-delete-card--pending" : ""}`}
            >
              {pendingDelete ? "⚠️ Confirm?" : "🗑️ Delete"}
            </button>
          </div>
        ) : (
          <Link to={`/listings/${_id}`} className="listing-card__button">
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
  }).isRequired,
  isOwnerView: PropTypes.bool,
  onUpdated: PropTypes.func,
};

export default memo(ListingCard);
