import PropTypes from "prop-types";
import { Link } from "react-router";
import UserAvatar from "./UserAvatar";
import StarRating from "../../../components/StarRating/StarRating";
import { Button } from "../../../components/ui";
import { TYPOGRAPHY } from "../../../constants/design-tokens";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Profile identity section with avatar, name, bio and edit actions.
 */
const ProfileInfo = ({ user, reviewsCount, isOwnProfile }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="relative -mt-14 sm:-mt-16 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#121212] shadow-xl overflow-hidden flex-shrink-0">
              <UserAvatar user={user} className="w-full h-full rounded-full" />
            </div>

            <div className="mb-1">
              <h1
                className="font-black text-gray-900 dark:text-white leading-none tracking-tight"
                style={{ fontSize: TYPOGRAPHY.H2 }}
              >
                {user.name}
              </h1>

              <div className="flex items-center gap-1 mt-2">
                <StarRating rating={user.averageRating || 0} />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold ml-1">
                  {reviewsCount > 0 && `(${reviewsCount})`}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                {user.city && user.country && (
                  <span className="flex items-center gap-1">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#10B77F]"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {user.city}, {user.country}
                  </span>
                )}
                {user.createdAt && (
                  <span className="flex items-center gap-1">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#10B77F]"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Member since {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:mb-1">
            {isOwnProfile && (
              <Link to="/profile/edit">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  }
                >
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>

        {user.bio && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};

ProfileInfo.propTypes = {
  user: PropTypes.object.isRequired,
  reviewsCount: PropTypes.number,
  isOwnProfile: PropTypes.bool,
};

export default ProfileInfo;
