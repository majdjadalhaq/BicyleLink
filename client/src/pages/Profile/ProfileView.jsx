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
import styles from "./ProfileView.module.css";

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
    return <div className={styles.loading}>Loading profile...</div>;
  if (error)
    return <div className={styles.error}>Error: {error.toString()}</div>;
  if (!profileData) return null;

  const { user, listings, reviewsReceived, reviewsGiven } = profileData;

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <header className={styles.header}>
        <div className={styles.avatarWrapper}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className={styles.avatar}
            />
          ) : (
            <FaUserCircle className={styles.avatarPlaceholder} />
          )}
        </div>
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>{user.name}</h1>
          <div className={styles.userMeta}>
            {user.city && user.country && (
              <span>
                <FaMapMarkerAlt /> {user.city}, {user.country}
              </span>
            )}
            <span>
              <FaCalendarAlt /> Joined{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Invalid Date"}
            </span>
          </div>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{user.averageRating || 0}</span>
            <span className={styles.statLabel}>
              <FaStar color="#f59e0b" /> Rating
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{listings.length}</span>
            <span className={styles.statLabel}>Listings</span>
          </div>
        </div>
        {currentUser &&
          (currentUser._id === user._id || currentUser.id === user._id) && (
            <div className={styles.actions}>
              <Link to="/profile/edit" className={styles.editBtn}>
                Edit Profile
              </Link>
            </div>
          )}
      </header>

      <div className={styles.contentGrid}>
        {/* Listings History */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Listing History</h2>
          <div className={styles.listingGrid}>
            {listings.length > 0 ? (
              listings.map((listing) => (
                <Link
                  to={`/listings/${listing._id}`}
                  key={listing._id}
                  className={styles.listingCard}
                >
                  {listing.images?.[0] && (
                    <img src={listing.images[0]} alt={listing.title} />
                  )}
                  <div className={styles.listingDetails}>
                    <h3>{listing.title}</h3>
                    <p className={styles.price}>${listing.price}</p>
                    <span
                      className={`${styles.status} ${styles[listing.status]}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className={styles.emptyMsg}>No listings found.</p>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <div className={styles.reviewsWrapper}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Reviews Received ({reviewsReceived.length})
            </h2>
            <div className={styles.reviewList}>
              {reviewsReceived.length > 0 ? (
                reviewsReceived.map((review) => (
                  <div key={review._id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      {review.reviewerId?.avatarUrl ? (
                        <img
                          src={review.reviewerId.avatarUrl}
                          alt=""
                          className={styles.reviewerAvatar}
                        />
                      ) : (
                        <FaUserCircle className={styles.reviewerAvatar} />
                      )}
                      <div>
                        <h4>{review.reviewerId?.name}</h4>
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#f59e0b" : "#e5e7eb"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMsg}>No reviews received yet.</p>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Reviews Given ({reviewsGiven.length})
            </h2>
            <div className={styles.reviewList}>
              {reviewsGiven.length > 0 ? (
                reviewsGiven.map((review) => (
                  <div key={review._id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      {review.targetId?.avatarUrl ? (
                        <img
                          src={review.targetId.avatarUrl}
                          alt=""
                          className={styles.reviewerAvatar}
                        />
                      ) : (
                        <FaUserCircle className={styles.reviewerAvatar} />
                      )}
                      <div>
                        <h4>Review for {review.targetId?.name}</h4>
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#f59e0b" : "#e5e7eb"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMsg}>No reviews given yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
