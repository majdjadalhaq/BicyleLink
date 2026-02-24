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
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-3">
        {isOwner ? (
          <>
            <button
              className={`w-full py-3.5 rounded-xl text-base font-semibold transition-colors text-white ${listing.status === "sold" ? "bg-sky-600 hover:bg-sky-700" : "bg-green-700 hover:bg-green-800"}`}
              onClick={handleStatusClick}
            >
              {listing.status === "sold" ? "Re-activate" : "Mark as Sold"}
            </button>
            <button
              className="bg-white dark:bg-dark-surface border border-emerald text-emerald w-full py-3.5 rounded-xl text-base font-semibold transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-center"
              onClick={() => navigate(`/listings/${id}/edit`)}
            >
              Edit Listing
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-emerald text-white w-full py-3.5 rounded-xl text-base font-semibold transition-colors hover:bg-emerald-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
        <button
          className="flex items-center justify-center gap-2 bg-transparent border-none text-slate-400 dark:text-slate-500 text-sm font-medium cursor-pointer p-2 mx-auto w-fit transition-all hover:text-red-500 hover:underline hover:scale-105"
          onClick={onReportClick}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform duration-200"
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
