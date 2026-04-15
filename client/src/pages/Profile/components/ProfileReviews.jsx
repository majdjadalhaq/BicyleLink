import { Link } from "react-router";
import PropTypes from "prop-types";
import StarRating from "../../../components/StarRating/StarRating";
import UserAvatar from "./UserAvatar";

/**
 * Split section showing reviews received and reviews given.
 */
const ProfileReviews = ({ reviewsReceived, reviewsGiven }) => {
  return (
    <div id="profile-reviews" className="flex flex-col gap-6 scroll-mt-24">
      {/* Reviews Received */}
      <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
        <h2 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Reviews ({reviewsReceived.length})
        </h2>

        <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
          {reviewsReceived.length > 0 ? (
            reviewsReceived.map((review) => (
              <div
                key={review._id}
                className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <UserAvatar
                      user={review.reviewerId}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                      {review.reviewerId?.name || "Anonymous"}
                    </p>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {review.comment}
                  </p>
                )}
                {review.listingId && (
                  <Link
                    to={`/listings/${typeof review.listingId === "object" ? review.listingId._id : review.listingId}`}
                    className="inline-flex items-center gap-1 mt-2 text-[10px] text-emerald-500 hover:text-emerald-600 font-bold uppercase tracking-widest"
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View listing
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic">
              No reviews yet.
            </p>
          )}
        </div>
      </section>

      {/* Reviews Given */}
      <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
        <h2 className="text-base font-black text-gray-900 dark:text-white mb-4">
          Reviews Given ({reviewsGiven.length})
        </h2>
        <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {reviewsGiven.length > 0 ? (
            reviewsGiven.map((review) => (
              <div
                key={review._id}
                className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <UserAvatar
                      user={review.targetId}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                      {review.targetId?.name}
                    </p>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic">
              No reviews given yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

ProfileReviews.propTypes = {
  reviewsReceived: PropTypes.array.isRequired,
  reviewsGiven: PropTypes.array.isRequired,
};

export default ProfileReviews;
