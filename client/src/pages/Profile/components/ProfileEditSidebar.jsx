import PropTypes from "prop-types";
import SubmitButton from "../../../components/form/SubmitButton";

const StarRating = ({ rating = 0 }) => {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i <= filled ? "#f59e0b" : "none"}
          stroke={i <= filled ? "#f59e0b" : "#6b7280"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
};

const StatPill = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 min-w-[80px]">
    <div className="text-emerald-500">{icon}</div>
    <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
      {value}
    </span>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
      {label}
    </span>
  </div>
);

StatPill.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]).isRequired,
};

const ProfileEditSidebar = ({
  user,
  avatarPreview,
  handleFileChange,
  joinedDate,
  bio,
  isLoading,
  isUploadingImage,
}) => {
  return (
    <div className="lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-24 flex flex-col gap-5">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-[#10B77F]/30 via-[#0EA572]/15 to-[#10221C]/20 dark:from-[#10B77F]/20 dark:via-[#10221C]/30 dark:to-[#121212] relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,183,127,0.15),transparent_70%)]" />
          </div>
          <div className="px-6 pb-6 flex flex-col items-center gap-4 -mt-12">
            <div className="relative">
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer block relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 dark:border-white/10 shadow-xl group/avatar"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-emerald-500/60"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[180px]">
                {user.name}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px] mt-0.5">
                {user.email}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <StatPill
                value={user?.listingCount ?? 0}
                label="Listings"
                icon={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                }
              />
              <StatPill
                value={
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{Number(user?.rating ?? 0).toFixed(1)}</span>
                    <StarRating rating={user?.rating ?? 0} />
                  </div>
                }
                label="Rating"
                icon={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                }
              />
            </div>

            {joinedDate && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Joined {joinedDate}
              </p>
            )}

            {bio && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center italic leading-relaxed line-clamp-3 border-t border-gray-100 dark:border-white/5 pt-4 w-full">
                &ldquo;{bio}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <SubmitButton
            isLoading={isLoading || isUploadingImage}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm uppercase tracking-widest"
          >
            Save Changes
          </SubmitButton>
        </div>
      </div>
    </div>
  );
};

ProfileEditSidebar.propTypes = {
  user: PropTypes.object.isRequired,
  avatarPreview: PropTypes.string,
  handleFileChange: PropTypes.func.isRequired,
  joinedDate: PropTypes.string,
  bio: PropTypes.string,
  isLoading: PropTypes.bool,
  isUploadingImage: PropTypes.bool,
};

export default ProfileEditSidebar;
