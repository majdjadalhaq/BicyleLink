import { useProfileView } from "./hooks/useProfileView";
import ProfileBanner from "./components/ProfileBanner";
import ProfileInfo from "./components/ProfileInfo";
import ProfileListings from "./components/ProfileListings";
import ProfileReviews from "./components/ProfileReviews";

/**
 * Optimized ProfileView component.
 * Modularized into separate UI concerns and a central logic hook.
 */
const ProfileView = () => {
  const {
    profileData,
    isLoading,
    error,
    isOwnProfile,
    gridRef,
    gridCols,
  } = useProfileView();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-red-500 dark:text-red-400 text-center">
        Error: {error.message || error.toString()}
      </div>
    );
  }

  if (!profileData) return null;

  const { user, listings, reviewsReceived, reviewsGiven } = profileData;

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-20">
      <ProfileBanner
        user={user}
        listingsCount={listings?.length || 0}
        soldCount={listings?.filter((l) => l.status === "sold")?.length || 0}
        averageRating={user?.averageRating || 0}
      />

      <ProfileInfo
        user={user}
        reviewsCount={reviewsReceived?.length || 0}
        isOwnProfile={isOwnProfile}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] gap-8">
          <ProfileListings
            listings={listings}
            gridRef={gridRef}
            gridCols={gridCols}
          />

          <ProfileReviews
            reviewsReceived={reviewsReceived}
            reviewsGiven={reviewsGiven}
          />
        </div>
      </main>
    </div>
  );
};

export default ProfileView;
