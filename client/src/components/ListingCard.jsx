import { memo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/ListingCard.css";
import FavoriteButton from "./FavoriteButton";

const ListingCard = ({ listing, isOwnerView = false }) => {
  const { _id, title, images, location, condition, brand } = listing;
  // Simple delete handling - in a real app, pass this down or use context
  // But for now, we'll just link to Edit. Delete might need a refresh callback.
  // Actually, let's keep it simple: specific buttons for My Listings view.

  let imageUrl =
    images && images.length > 0
      ? images[0]
      : "https://placehold.co/600x400?text=No+Image";

  // Optimization: Cloudinary transformation for list thumbnails
  // Add width, height, auto-format, and auto-quality
  if (imageUrl.includes("cloudinary.com")) {
    imageUrl = imageUrl.replace(
      "/upload/",
      "/upload/w_500,h_400,c_fill,f_auto,q_auto/",
    );
  }

  // Handle price display: backend now sends price as a plain string/number
  const displayPrice = listing.price?.$numberDecimal || listing.price;
  const currencySymbol = "€"; // Standardizing to Euro for this marketplace

  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent link navigation
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const token = localStorage.getItem("token"); // Quick fix, ideally useAuth or interceptor
        const res = await fetch(`/api/listings/${_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          window.location.reload(); // Simple refresh to update list
        } else {
          alert("Failed to delete");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting item");
      }
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusToggle = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const newStatus = listing.status === "active" ? "sold" : "active";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/listings/${_id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        window.location.reload(); // Simple refresh to see changes
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setIsUpdating(false);
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
            {listing.ownerId && listing.ownerId.name && (
              <span className="listing-card__seller">
                by {listing.ownerId.name}
              </span>
            )}
          </div>
          <h3 className="listing-card__title">{title}</h3>
        </div>

        <div className="listing-card__price">
          {currencySymbol}
          {displayPrice}
        </div>

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
