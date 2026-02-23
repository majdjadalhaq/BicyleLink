import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FavoriteButton from "../../../components/FavoriteButton";

const ListingActions = ({
  listing,
  isOwner,
  user,
  id,
  handleStatusClick,
  onReportClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="action-buttons-container">
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

      {!isOwner && (
        <button className="btn-report-link" onClick={onReportClick}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          Report this listing
        </button>
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
  onReportClick: PropTypes.func.isRequired,
};

export default ListingActions;
