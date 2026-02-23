import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FavoriteButton from "../../../components/FavoriteButton";

const ListingActions = ({ listing, isOwner, user, id, handleStatusClick }) => {
  const navigate = useNavigate();

  return (
    <div className="action-buttons">
      {isOwner ? (
        <>
          <button
            className={`btn-status ${listing.status === "sold" ? "btn-undo" : "btn-sold"}`}
            onClick={handleStatusClick}
          >
            {listing.status === "sold" ? "Re-activate" : "Mark as Sold"}
          </button>
          <button
            className="btn-edit"
            onClick={() => navigate(`/listings/${id}/edit`)}
          >
            Edit Listing
          </button>
        </>
      ) : (
        <>
          <button
            className="btn-contact"
            disabled={listing.status === "sold"}
            onClick={() => {
              if (!user) {
                navigate("/login", {
                  state: { from: `/listings/${id}` },
                });
              } else {
                const sellerId = listing.ownerId?._id || listing.ownerId;
                navigate(`/chat/${id}?receiverId=${sellerId}`);
              }
            }}
          >
            {listing.status === "sold" ? "Item Sold" : "Contact Seller"}
          </button>
          <FavoriteButton listingId={listing._id} variant="button" />
        </>
      )}
    </div>
  );
};

ListingActions.propTypes = {
  listing: PropTypes.object.isRequired,
  isOwner: PropTypes.bool.isRequired,
  user: PropTypes.object,
  id: PropTypes.string.isRequired,
  handleStatusClick: PropTypes.func.isRequired,
};

export default ListingActions;
