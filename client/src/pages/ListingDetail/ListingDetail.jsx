import { lazy, Suspense } from "react";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import ReviewsList from "../../components/ReviewsList/ReviewsList";
import ListingImageCarousel from "../../components/ListingImageCarousel/ListingImageCarousel";
import SellerCard from "../../components/SellerCard/SellerCard";
import MarkAsSoldModal from "./components/MarkAsSoldModal";

const LocationMap = lazy(() => import("../../components/Map/LocationMap"));

// Subcomponents
import ListingHeader from "./components/ListingHeader";
import ListingInfo from "./components/ListingInfo";
import ListingActions from "./components/ListingActions";
import ListingSpecs from "./components/ListingSpecs";
import StickyContactBar from "./components/StickyContactBar";
import BicycleLoading from "../../components/ui/BicycleLoading";
import ReportModal from "../../components/ReportModal/ReportModal";

// Hooks
import useListingDetail from "./hooks/useListingDetail";

const ListingDetail = () => {
  const {
    id,
    listing,
    loading,
    error,
    user,
    isOwner,
    canRate,
    canViewReviews,
    statusModalOpen,
    setStatusModalOpen,
    candidates,
    isLoadingCandidates,
    selectedBuyerId,
    setSelectedBuyerId,
    reviewModalOpen,
    setReviewModalOpen,
    isSubmittingReview,
    reviewsListOpen,
    setReviewsListOpen,
    reviewsRefreshTrigger,
    setReviewsRefreshTrigger,
    setHasReviewed,
    handleStatusClick,
    handleStatusUpdate,
    handleReviewSubmit,
    displayPrice,
    reportModalOpen,
    setReportModalOpen,
    isSubmittingReport,
    handleReportSubmit,
  } = useListingDetail();

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <BicycleLoading message="Retrieving listing details..." />
      </div>
    );
  if (error)
    return (
      <div className="max-w-6xl mx-auto p-5 text-gray-500 dark:text-gray-400">
        Error: {error}
      </div>
    );
  if (!listing) return null;

  const sellerData = {
    name: listing.ownerId?.name,
    averageRating: listing.ownerId?.averageRating ?? 0,
    reviewCount: listing.ownerId?.reviewCount ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-[150px] md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        {/* ── Main 2-column sticky layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left — sticky image column */}
          <div className="w-full lg:w-1/2 min-w-0 lg:sticky lg:top-24 flex flex-col gap-4">
            <ListingImageCarousel
              images={listing.images || []}
              title={listing.title}
              status={listing.status}
            />

            {/* ── Desktop-only: thumbnail strip ── */}
            {listing.images?.length > 1 && (
              <div className="hidden lg:grid grid-cols-4 gap-2">
                {listing.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`${listing.title} — photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── Desktop-only: quick seller snapshot ── */}
            <div className="hidden lg:flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl font-black flex-shrink-0 shadow-lg shadow-emerald-500/20">
                {listing.ownerId?.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 dark:text-white text-sm truncate">
                  {listing.ownerId?.name || "Seller"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill={
                        i <= Math.round(listing.ownerId?.averageRating ?? 0)
                          ? "#f59e0b"
                          : "none"
                      }
                      stroke={
                        i <= Math.round(listing.ownerId?.averageRating ?? 0)
                          ? "#f59e0b"
                          : "#4b5563"
                      }
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1 font-semibold">
                    {(listing.ownerId?.averageRating ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex-shrink-0">
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified
              </span>
            </div>
          </div>

          {/* Right — scrollable info column */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <ListingHeader listing={listing} isOwner={isOwner} />
            <ListingInfo listing={listing} displayPrice={displayPrice} />

            <ListingActions
              listing={listing}
              isOwner={isOwner}
              user={user}
              id={id}
              handleStatusClick={handleStatusClick}
              onReportClick={() => setReportModalOpen(true)}
            />

            <SellerCard
              seller={sellerData}
              canRate={canRate}
              canViewReviews={canViewReviews}
              isSold={listing.status === "sold"}
              onRate={() => setReviewModalOpen(true)}
              onViewReviews={() => setReviewsListOpen(true)}
            />

            <ListingSpecs listing={listing} />

            {/* Description */}
            {listing.description && (
              <div className="bg-white dark:bg-[#1a1a1a] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                  Description
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line text-sm">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Location Map */}
            {listing.coordinates?.coordinates && (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-[#2a2a2a] shadow-sm">
                {/* Floating approximate-location label */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/10 shadow-md text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <svg
                    width="11"
                    height="11"
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
                  Approximate location
                  {listing.location && <span className="text-gray-400">·</span>}
                  {listing.location && <span>{listing.location}</span>}
                </div>
                <Suspense
                  fallback={
                    <div className="h-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />
                  }
                >
                  <LocationMap
                    coordinates={listing.coordinates}
                    title="Bike Location"
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        <MarkAsSoldModal
          isOpen={statusModalOpen}
          candidates={candidates}
          isLoading={isLoadingCandidates}
          selectedBuyerId={selectedBuyerId}
          onBuyerChange={setSelectedBuyerId}
          onConfirm={() => handleStatusUpdate("sold")}
          onClose={() => setStatusModalOpen(false)}
        />

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
        />

        <ReviewsList
          isOpen={reviewsListOpen}
          onClose={() => setReviewsListOpen(false)}
          userId={listing.ownerId?._id}
          userName={listing.ownerId?.name}
          refreshTrigger={reviewsRefreshTrigger}
          onReviewDeleted={() => {
            setHasReviewed(false);
            setReviewsRefreshTrigger((prev) => prev + 1);
          }}
        />

        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleReportSubmit}
          isSubmitting={isSubmittingReport}
          targetTitle={listing.title}
        />

        {/* Sticky Mobile Bar */}
        <StickyContactBar
          listing={listing}
          displayPrice={displayPrice}
          id={id}
          user={user}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};

export default ListingDetail;
