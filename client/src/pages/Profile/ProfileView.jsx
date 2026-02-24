import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";

const ProfileView = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);

  const profileId = id || currentUser?._id || currentUser?.id;

  const { isLoading, error, performFetch } = useFetch(
    profileId ? `/users/${profileId}/profile` : null,
    (data) => setProfileData(data),
  );

  useEffect(() => {
    if (profileId) {
      performFetch();
    }
  }, [profileId]);

  if (isLoading)
    return (
      <div className="text-center p-10 text-lg text-gray-900 dark:text-gray-100">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="text-center p-10 text-lg text-red-600 dark:text-red-400">
        Error: {error.toString()}
      </div>
    );
  if (!profileData) return null;

  const { user, listings, reviewsReceived, reviewsGiven } = profileData;

  return (
    <div className="max-w-5xl mx-auto py-10 px-5 animate-in slide-in-from-bottom-2 duration-300">
      {/* Profile Header */}
      <header className="flex flex-wrap items-center gap-8 bg-white dark:bg-dark-surface p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-50 dark:border-dark-border flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-full h-full text-slate-300 dark:text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-[250px]">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {user.name}
          </h1>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">
            {user.city && user.country && (
              <span className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-emerald" /> {user.city},{" "}
                {user.country}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-emerald" /> Joined{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Invalid Date"}
            </span>
          </div>
          {user.bio && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}
        </div>
        <div className="flex gap-4 sm:gap-6 flex-wrap mt-4 sm:mt-0 lg:ml-auto w-full lg:w-auto overflow-hidden">
          <div className="flex flex-col flex-1 lg:flex-none items-center justify-center bg-gray-50 dark:bg-dark-input p-4 rounded-xl min-w-[100px] border border-gray-100 dark:border-dark-border">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.averageRating || 0}
            </span>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1 uppercase tracking-wide">
              <FaStar color="#f59e0b" /> Rating
            </span>
          </div>
          <div className="flex flex-col flex-1 lg:flex-none items-center justify-center bg-gray-50 dark:bg-dark-input p-4 rounded-xl min-w-[100px] border border-gray-100 dark:border-dark-border">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {listings.length}
            </span>
            <span className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">
              Listings
            </span>
          </div>
        </div>
        {currentUser &&
          (currentUser._id === user._id || currentUser.id === user._id) && (
            <div className="w-full flex justify-end mt-2">
              <Link
                to="/profile/edit"
                className="bg-emerald hover:bg-emerald-hover text-white px-5 py-2.5 rounded-lg font-semibold transition-colors text-sm shadow-sm inline-flex items-center gap-2"
              >
                Edit Profile
              </Link>
            </div>
          )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-8">
        {/* Listings History */}
        <section className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border h-fit">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Listing History
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <Link
                  to={`/listings/${listing._id}`}
                  key={listing._id}
                  className="group border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden text-decoration-none transition-all hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald/50 bg-white dark:bg-dark-input flex flex-col"
                >
                  <div className="h-36 sm:h-40 overflow-hidden bg-gray-100 dark:bg-dark-surface">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {listing.title}
                    </h3>
                    <p className="font-bold text-emerald mb-4">
                      €{listing.price}
                    </p>
                    <div className="mt-auto">
                      <span
                        className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${listing.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
                      >
                        {listing.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="col-span-1 sm:col-span-2 text-gray-400 italic text-sm py-4">
                No listings found.
              </p>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <div className="flex flex-col gap-8">
          <section className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Reviews Received ({reviewsReceived.length})
            </h2>
            <div className="flex flex-col gap-4">
              {reviewsReceived.length > 0 ? (
                reviewsReceived.map((review) => (
                  <div
                    key={review._id}
                    className="p-5 bg-gray-50 dark:bg-dark-input rounded-xl border border-gray-100 dark:border-dark-border"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {review.reviewerId?.avatarUrl ? (
                        <img
                          src={review.reviewerId.avatarUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-dark-border"
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white m-0 leading-tight">
                          {review.reviewerId?.name}
                        </h4>
                        <div className="flex gap-0.5 mt-1 text-[10px] sm:text-xs">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#f59e0b" : "#e5e7eb"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No reviews received yet.
                </p>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Reviews Given ({reviewsGiven.length})
            </h2>
            <div className="flex flex-col gap-4">
              {reviewsGiven.length > 0 ? (
                reviewsGiven.map((review) => (
                  <div
                    key={review._id}
                    className="p-5 bg-gray-50 dark:bg-dark-input rounded-xl border border-gray-100 dark:border-dark-border"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {review.targetId?.avatarUrl ? (
                        <img
                          src={review.targetId.avatarUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-dark-border"
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white m-0 leading-tight">
                          Review for {review.targetId?.name}
                        </h4>
                        <div className="flex gap-0.5 mt-1 text-[10px] sm:text-xs">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#f59e0b" : "#e5e7eb"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No reviews given yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
