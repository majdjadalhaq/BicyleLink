import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/ListingCard.css";

const ListingCard = ({ listing }) => {
  const { _id, title, price, images, location, condition } = listing;

  const imageUrl =
    images && images.length > 0
      ? images[0]
      : "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="listing-card" data-id={_id}>
      <div className="listing-card__image-container">
        <img src={imageUrl} alt={title} className="listing-card__image" />
        <span className="listing-card__badge listing-card__badge--sale">
          For Sale
        </span>
      </div>

      <div className="listing-card__content">
        <h3 className="listing-card__title">{title}</h3>

        <div className="listing-card__price">€{price.toString()}</div>

        <div className="listing-card__details">
          <span className="listing-card__location">
            <span aria-hidden="true">📍</span> {location}
          </span>
          <span className="listing-card__condition">{condition}</span>
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
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string.isRequired,
    condition: PropTypes.string,
  }).isRequired,
};

export default ListingCard;
