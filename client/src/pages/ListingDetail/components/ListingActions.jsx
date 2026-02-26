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
    <div className="flex flex-col gap-3">
      {isOwner ? (
        <div className="flex flex-col gap-3">
          <button
            className={`w-full py-4 rounded-2xl text-sm font-black tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] text-white flex items-center justify-center gap-2 ${
              listing.status === "sold"
                ? "bg-sky-600 hover:bg-sky-700 shadow-sky-500/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            }`}
            onClick={handleStatusClick}
            title={
              listing.status === "sold" ? "Re-activate Listing" : "Mark as Sold"
            }
          >
            {listing.status === "sold" ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Re-activate
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark as Sold
              </>
            )}
          </button>

          <button
            className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={() => navigate(`/listings/${id}/edit`)}
            title="Edit this listing"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Listing
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            className="bg-emerald-600 dark:bg-emerald-500 text-white w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-xl shadow-emerald-600/20 dark:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={listing.status === "sold"}
            onClick={() => {
              if (!user) {
                navigate("/login", { state: { from: `/listings/${id}` } });
              } else {
                const sellerId = listing.ownerId?._id || listing.ownerId;
                navigate(`/chat/${id}?receiverId=${sellerId}`);
              }
            }}
            title={
              listing.status === "sold"
                ? "Item has been sold"
                : "Contact Seller"
            }
          >
            {listing.status === "sold" ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                Item Sold
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Contact Seller
              </>
            )}
          </button>

          <FavoriteButton listingId={listing._id} variant="button" />
        </div>
      )}

      {!isOwner && (
        <button
          className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest cursor-pointer p-2 mx-auto w-fit transition-all hover:text-red-500 active:scale-95"
          onClick={onReportClick}
          title="Report this listing"
          aria-label="Report this listing"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          Report listing
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
