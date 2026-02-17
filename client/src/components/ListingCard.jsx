import { memo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/ListingCard.css";

const ListingCard = ({ listing }) => {
  const { _id, title, price, images, location, condition, brand } = listing;

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
  const displayPrice = price;
  const currencySymbol = "€"; // Standardizing to Euro for this marketplace

  return (
    <div className="listing-card" data-id={_id}>
      <div className="listing-card__image-container">
        <img src={imageUrl} alt={title} className="listing-card__image" />
        {condition && <span className="listing-card__badge">{condition}</span>}
      </div>

      <div className="listing-card__content">
        <div className="listing-card__header">
          {brand && <span className="listing-card__brand">{brand}</span>}
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
        </div>

        <Link to={`/listings/${_id}`} className="listing-card__button">
          View Details
        </Link>
      </div>
    </div>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string.isRequired,
    condition: PropTypes.string,
    brand: PropTypes.string,
  }).isRequired,
};

export default memo(ListingCard);
