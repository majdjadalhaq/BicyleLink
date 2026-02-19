import { memo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/ListingCard.css";
import FavoriteButton from "./FavoriteButton";
import { optimiseCloudinaryUrl } from "../utils/cloudinary";
import useApi from "../hooks/useApi";

const ListingCard = ({ listing, isOwnerView = false }) => {
  const { _id, title, images, location, condition, brand } = listing;
  const [isUpdating, setIsUpdating] = useState(false);
  const { execute: executeApi } = useApi();

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

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;

    const data = await executeApi(`/api/listings/${_id}`, {
      method: "DELETE",
    });

    if (data?.success !== false) {
      window.location.reload();
    } else {
      alert("Failed to delete");
    }
  };

  const handleStatusToggle = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const newStatus = listing.status === "active" ? "sold" : "active";

    const data = await executeApi(`/api/listings/${_id}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });

    setIsUpdating(false);

    if (data?.success) {
      window.location.reload();
    } else {
      alert("Failed to update status");
    }
  };

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
            <button onClick={handleDelete} className="btn-delete-card">
              🗑️ Delete
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
};

export default memo(ListingCard);
