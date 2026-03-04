import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";

const ListingCard = lazy(() => import("../../components/ListingCard"));
import StarRating from "../../components/StarRating/StarRating";

/* ─── Helpers ────────────────────────────────────────────────── */
/* ─── Grid column detector ───────────────────────────────────────── */
const useGridCols = (gridRef) => {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    if (!gridRef.current) return;
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const colsStr = style.getPropertyValue("grid-template-columns");
      if (colsStr && colsStr !== "none") {
        setCols(colsStr.trim().split(/\s+/).length);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [gridRef]);
  return cols;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const UserAvatar = ({ user, className }) =>
  user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.name || "User"}
      className={`object-cover ${className}`}
    />
  ) : (
    <div
      className={`bg-emerald-500/20 flex items-center justify-center ${className}`}
    >
      <svg
        className="w-1/2 h-1/2 text-emerald-500/60"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    </div>
  );

/* ─── Main Component ─────────────────────────────────────────── */
const ProfileView = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const gridRef = useRef(null);
  const gridCols = useGridCols(gridRef);

  const profileIdentifier =
    username || id || currentUser?.name || currentUser?._id;

  const { isLoading, error, performFetch } = useFetch(
    profileIdentifier ? `/users/${profileIdentifier}/profile` : null,
    (data) => setProfileData(data),
  );

  useEffect(() => {
    if (profileIdentifier) performFetch();
  }, [profileIdentifier]);

  useEffect(() => {
    if (profileData?.user?.name) {
      const urlParam = username || id;
      if (urlParam && urlParam !== profileData.user.name) {
        navigate(`/profile/${encodeURIComponent(profileData.user.name)}`, {
          replace: true,
        });
      }
    }
  }, [profileData, username, id, navigate]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-gray-500">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="max-w-5xl mx-auto p-10 text-red-500 dark:text-red-400 text-center">
        Error: {error.toString()}
      </div>
    );
  if (!profileData) return null;

  const { user, listings, reviewsReceived, reviewsGiven } = profileData;
  const isOwnProfile =
    currentUser &&
    (currentUser._id === user._id || currentUser.id === user._id);

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-20">
      {/* ── FULL-BLEED Banner ── */}
      <div className="w-full h-48 sm:h-64 relative overflow-hidden bg-[#10221C] border-b border-[#10B77F]/20">
        <div className="absolute inset-0 z-0">
          <img
            src="/premium_cycling_cover_1772204408302.png"
            alt="Elite Cycling"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#10221C]/60 via-[#08120F]/40 to-[#10B77F]/10 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF8] dark:from-[#121212] via-transparent to-transparent z-20" />
        </div>

        {/* Decorative glass overlay */}
        <div className="absolute inset-0 z-30 opacity-70" />

        {/* Profile Statistics Glass Banner */}
        <div className="absolute bottom-6 right-6 z-40 hidden md:flex items-center gap-3 animate-reveal">
          <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-6">
            <button
              onClick={() => {
                document
                  .getElementById("profile-listings")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex flex-col items-center px-2 border-r border-white/5 hover:scale-105 hover:text-emerald-300 transition-all group"
            >
              <span className="text-2xl font-black text-white leading-none group-hover:text-emerald-400 transition-colors">
                {listings?.length || 0}
              </span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all">
                Listings
              </span>
            </button>
            <div className="flex flex-col items-center px-2 border-r border-white/5">
              <span className="text-2xl font-black text-white leading-none">
                {listings?.filter((l) => l.status === "sold")?.length || 0}
              </span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 grayscale opacity-70">
                Sold
              </span>
            </div>
            <button
              onClick={() => {
                document
                  .getElementById("profile-reviews")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex flex-col items-center px-2 hover:scale-105 transition-all group"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-white leading-none group-hover:text-amber-400 transition-colors">
                  {Number(user?.averageRating || 0).toFixed(1)}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="#f59e0b"
                  className="mb-0.5 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all">
                Rating
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Constrained content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Avatar row overlapping banner */}
        <div className="relative -mt-14 sm:-mt-16 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#121212] shadow-xl overflow-hidden flex-shrink-0">
                <UserAvatar
                  user={user}
                  className="w-full h-full rounded-full"
                />
              </div>

              {/* Name + meta */}
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                    {user.name}
                  </h1>
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <StarRating rating={user.averageRating || 0} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold ml-1">
                    {reviewsReceived.length > 0 &&
                      `(${reviewsReceived.length})`}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
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
                        className="text-emerald-500"
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
                        className="text-emerald-500"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
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

            {/* Action buttons */}
            <div className="flex gap-2 sm:mb-1">
              {!isOwnProfile && (
                <Link
                  to={`/inbox?contact=${encodeURIComponent(user.name)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
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
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Message
                </Link>
              )}
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:border-emerald-500/30 hover:text-emerald-500 transition-all"
                >
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
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] gap-8">
          {/* Left: Listings */}
          <section id="profile-listings" className="scroll-mt-24">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Listings
              <span className="text-sm font-bold text-gray-400">
                ({listings.length})
              </span>
            </h2>
            {listings.length > 0 ? (
              <div
                ref={gridRef}
                className="grid gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                }}
              >
                <Suspense
                  fallback={
                    <div className="col-span-full h-32 animate-pulse bg-gray-100 dark:bg-white/5 rounded-2xl" />
                  }
                >
                  {listings.map((l, i) => {
                    const row = Math.floor(i / gridCols);
                    const col = i % gridCols;
                    return (
                      <motion.div
                        key={l._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: row * 0.18 + col * 0.08,
                          ease: [0.21, 1.11, 0.81, 0.99],
                        }}
                      >
                        <ListingCard listing={l} />
                      </motion.div>
                    );
                  })}
                </Suspense>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/5">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-300 dark:text-gray-700 mb-3"
                >
                  <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
                  <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
                  <path d="M12 6V3" />
                </svg>
                <p className="text-gray-400 text-sm font-medium">
                  No listings yet
                </p>
              </div>
            )}
          </section>

          {/* Right: Reviews */}
          <div
            id="profile-reviews"
            className="flex flex-col gap-6 scroll-mt-24"
          >
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
              <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1">
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
                          {typeof review.listingId === "object"
                            ? review.listingId.title || "View listing"
                            : "View listing"}
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
              <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1">
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
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
