import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/ListingCard.css";

const ListingCard = ({ listing }) => {
  const { _id, title, price, images, location, condition, brand } = listing;

  const imageUrl =
    images && images.length > 0
      ? images[0]
      : "https://placehold.co/600x400?text=No+Image";

  // Handle price display:
  // 1. Check for Mongoose Decimal128 format (e.g. { $numberDecimal: "1450" })
  // 2. Check for object format (e.g. { value: 1450 })
  // 3. Fallback to raw value
  let displayPrice = price;
  if (price && typeof price === "object") {
    if (price.$numberDecimal) {
      displayPrice = price.$numberDecimal;
    } else if (price.value) {
      displayPrice = price.value;
    }
  }

  const currencySymbol = price?.currency === "USD" ? "$" : "€";

  return (
    <div className="listing-card" data-id={_id}>
      <div className="listing-card__image-container">
        <img src={imageUrl} alt={title} className="listing-card__image" />
        {condition && (
          <span className="listing-card__badge listing-card__badge--sale">
            {condition}
          </span>
        )}
      </div>

      <div className="listing-card__content">
        <div className="listing-card__header">
          <h3 className="listing-card__title">{title}</h3>
          {brand && <span className="listing-card__brand">{brand}</span>}
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
    price: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.number,
        currency: PropTypes.string,
      }),
    ]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string.isRequired,
    condition: PropTypes.string,
    brand: PropTypes.string,
  }).isRequired,
};

export default ListingCard;
