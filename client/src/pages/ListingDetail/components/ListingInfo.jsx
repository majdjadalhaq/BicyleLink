import { formatDistanceToNow } from "date-fns";
import PropTypes from "prop-types";

const ListingInfo = ({ listing, displayPrice }) => {
  return (
    <>
      <div className="listing-metadata">
        <span className="listing-price">€{displayPrice}</span>
        <span className="posted-time">
          Posted {formatDistanceToNow(new Date(listing.createdAt))} ago
        </span>
      </div>

      <div className="badges">
        {listing.condition && (
          <span className="badge badge-condition">{listing.condition}</span>
        )}
        {listing.location && (
          <span className="badge badge-location">{listing.location}</span>
        )}
      </div>
    </>
  );
};

ListingInfo.propTypes = {
  listing: PropTypes.object.isRequired,
  displayPrice: PropTypes.string.isRequired,
};

export default ListingInfo;
