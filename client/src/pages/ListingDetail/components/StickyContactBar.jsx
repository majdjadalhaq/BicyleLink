import PropTypes from "prop-types";
import { useNavigate } from "react-router";

const StickyContactBar = ({ listing, displayPrice, isOwner, user, id }) => {
  const navigate = useNavigate();

  if (listing.status === "sold" && !isOwner) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-[40] md:hidden bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-t border-gray-200 dark:border-[#2a2a2a] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
            €{displayPrice}
          </span>
        </div>

        <button
          className="flex-1 max-w-[200px] py-3 bg-[#10B77F] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-glow active:scale-[0.98] transition-all"
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
