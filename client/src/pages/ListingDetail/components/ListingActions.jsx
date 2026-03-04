import { useNavigate } from "react-router";
import PropTypes from "prop-types";
import FavoriteButton from "../../../components/FavoriteButton";

const ActionIcon = ({
  onClick,
  icon,
  label,
  variant = "default",
  disabled = false,
}) => {
  const baseClasses =
    "group flex items-center justify-center h-10 transition-all duration-300 rounded-full shadow-lg backdrop-blur-md pointer-events-auto border border-white/20 dark:border-white/10 ";
  const colorClasses =
    variant === "danger"
      ? "bg-red-500/90 text-white hover:bg-red-600"
      : variant === "primary"
        ? "bg-[#10B77F] text-white hover:bg-[#0EA572] hover:shadow-glow-strong"
        : variant === "sold"
          ? "bg-sky-600/90 text-white hover:bg-sky-700 hover:shadow-sky-500/20"
          : "bg-white/90 text-gray-800 dark:bg-[#10221C]/90 dark:text-gray-200 hover:text-[#10B77F] hover:shadow-glow";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${colorClasses} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={label}
    >
      <div className="w-10 h-10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pr-4 group-hover:-ml-1">
        <span className="text-sm font-bold whitespace-nowrap">{label}</span>
      </div>
    </button>
  );
};

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
    <div className="absolute top-4 right-4 z-[20] flex flex-col items-end gap-3 pointer-events-none">
      {isOwner ? (
        <>
          <ActionIcon
            onClick={handleStatusClick}
            label={listing.status === "sold" ? "Re-activate" : "Mark as Sold"}
            variant={listing.status === "sold" ? "sold" : "primary"}
            icon={
              listing.status === "sold" ? (
                <svg
                  width="18"
                  height="18"
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
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )
            }
          />
          <ActionIcon
            onClick={() => navigate(`/listings/${id}/edit`)}
            label="Edit Listing"
            variant="default"
            icon={
              <svg
                width="18"
                height="18"
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
            }
          />
        </>
      ) : (
        <>
          <ActionIcon
            disabled={listing.status === "sold"}
            onClick={() => {
              if (!user) {
                navigate("/login", { state: { from: `/listings/${id}` } });
              } else {
                const sellerId = listing.ownerId?._id || listing.ownerId;
                navigate(`/chat/${id}?receiverId=${sellerId}`);
              }
            }}
            label={listing.status === "sold" ? "Item Sold" : "Contact Seller"}
            variant="primary"
            icon={
              listing.status === "sold" ? (
                <svg
                  width="18"
                  height="18"
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
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )
            }
          />

          <FavoriteButton listingId={listing._id} variant="action-overlay" />

          <ActionIcon
            onClick={onReportClick}
            label="Report listing"
            variant="default"
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 group-hover:text-red-500 transition-colors"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            }
          />
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
  onReportClick: PropTypes.func.isRequired,
};

export default ListingActions;
