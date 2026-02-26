import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const StickyContactBar = ({ listing, displayPrice, isOwner, user, id }) => {
  const navigate = useNavigate();

  if (listing.status === "sold" && !isOwner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] md:hidden bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#2a2a2a] px-4 py-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.10)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {"Price"}
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
            €{displayPrice}
          </span>
        </div>

        <button
          className="flex-1 max-w-[200px] py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20 active:scale-95 transition-all"
          onClick={() => {
            if (isOwner) {
              navigate(`/listings/${id}/edit`);
            } else if (!user) {
              navigate("/login", { state: { from: `/listings/${id}` } });
            } else {
              const sellerId = listing.ownerId?._id || listing.ownerId;
              navigate(`/chat/${id}?receiverId=${sellerId}`);
            }
          }}
        >
          {isOwner ? "Edit Listing" : "Contact Seller"}
        </button>
      </div>
    </div>
  );
};

StickyContactBar.propTypes = {
  listing: PropTypes.object.isRequired,
  displayPrice: PropTypes.string.isRequired,
  isOwner: PropTypes.bool.isRequired,
  user: PropTypes.object,
  id: PropTypes.string.isRequired,
};

export default StickyContactBar;
