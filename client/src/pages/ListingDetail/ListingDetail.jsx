import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import ReviewsList from "../../components/ReviewsList/ReviewsList";
import ListingImageCarousel from "../../components/ListingImageCarousel/ListingImageCarousel";
import SellerCard from "../../components/SellerCard/SellerCard";
import MarkAsSoldModal from "../../components/MarkAsSoldModal";

const LocationMap = lazy(() => import("../../components/Map/LocationMap"));

// Subcomponents
import ListingHeader from "./components/ListingHeader";
import ListingInfo from "./components/ListingInfo";
import ListingActions from "./components/ListingActions";
import ListingSpecs from "./components/ListingSpecs";
import StickyContactBar from "./components/StickyContactBar";
import { ListingDetailSkeleton } from "../../components/ui/SkeletonLoaders";
import ReportModal from "../../components/ReportModal/ReportModal";

// Hooks
import useListingDetail from "./hooks/useListingDetail";

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

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
    navigate,
  } = useListingDetail();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (listing?.title) {
      document.title = `${listing.title} | BiCycleL`;
    }
    return () => {
      document.title = "BiCycleL | Premium marketplace for used bikes";
    };
  }, [listing]);

  if (loading) return <ListingDetailSkeleton />;
  if (error || !listing)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Listing Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
          {error ||
            "The bicycle you're looking for might have been sold, removed, or the link is broken."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          Back to Garage
        </Link>
      </div>
    );

  const sellerData = {
    _id: listing.ownerId?._id,
    name: listing.ownerId?.name,
    averageRating: listing.ownerId?.averageRating ?? 0,
    reviewCount: listing.ownerId?.reviewCount ?? 0,
    avatarUrl: listing.ownerId?.avatarUrl,
    bio: listing.ownerId?.bio,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-[150px] md:pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-0 sm:pt-6">
        {/* Back Button - Desktop Top */}
        <div className="hidden md:block mb-6 px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-500 transition-colors group"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-1"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Listings
          </Link>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] gap-8 lg:gap-14 items-start w-full min-w-0">
          {/* Main Content Column (Left Side) - Images & Description */}
          <div className="w-full flex flex-col gap-6 lg:gap-8">
            {/* Images with Overlay Actions */}
            <FadeIn>
              <div className="relative group/carousel block overflow-hidden rounded-2xl w-full">
                <ListingImageCarousel
                  images={listing.images || []}
                  title={listing.title}
                  status={listing.status}
                />
                <ListingActions
                  listing={listing}
                  isOwner={isOwner}
                  user={user}
                  id={id}
                  handleStatusClick={handleStatusClick}
                  onReportClick={() => setReportModalOpen(true)}
                />
              </div>
            </FadeIn>

            {/* Mobile Only: Header, Pricing, Specs */}
            <FadeIn
              delay={0.1}
              className="lg:hidden flex flex-col gap-4 mt-2 px-4 sm:px-0"
            >
              <ListingHeader listing={listing} isOwner={isOwner} />
              <ListingInfo listing={listing} displayPrice={displayPrice} />
              <ListingSpecs listing={listing} />
            </FadeIn>

            {/* Description */}
            {listing.description && (
              <FadeIn
                delay={0.2}
                className="bg-white dark:bg-[#1a1a1a] p-6 lg:p-8 sm:rounded-2xl border-y sm:border border-gray-100 dark:border-white/5 shadow-sm"
              >
                <h3 className="text-xl font-black mb-4 text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-white/5 pb-4">
                  Description
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line text-[15px]">
                  {listing.description}
                </p>
              </FadeIn>
            )}

            {/* Mobile Only: Seller & Map */}
            <div className="lg:hidden flex flex-col gap-6 mt-2 px-4 sm:px-0">
              <div>
                <SellerCard
                  seller={sellerData}
                  canRate={canRate}
                  canViewReviews={canViewReviews}
                  isSold={listing.status === "sold"}
                  onRate={() => setReviewModalOpen(true)}
                  onViewReviews={() => setReviewsListOpen(true)}
                  onViewProfile={() =>
                    navigate(`/profile/${sellerData._id}?fromListing=${id}`)
                  }
                />
              </div>

              {listing.coordinates?.coordinates && (
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
              )}
            </div>
          </div>

          {/* Details / Action Column (Right Side) - Desktop Only */}
          <div className="hidden lg:flex w-full flex-col gap-6 sticky top-24">
            <FadeIn delay={0.1}>
              <ListingHeader listing={listing} isOwner={isOwner} />
            </FadeIn>

            <FadeIn delay={0.15}>
              <ListingInfo listing={listing} displayPrice={displayPrice} />
            </FadeIn>

            <FadeIn delay={0.2}>
              <ListingSpecs listing={listing} />
            </FadeIn>

            <FadeIn delay={0.25}>
              <SellerCard
                seller={sellerData}
                canRate={canRate}
                canViewReviews={canViewReviews}
                isSold={listing.status === "sold"}
                onRate={() => setReviewModalOpen(true)}
                onViewReviews={() => setReviewsListOpen(true)}
                onViewProfile={() =>
                  navigate(`/profile/${sellerData._id}?fromListing=${id}`)
                }
              />
            </FadeIn>

            {listing.coordinates?.coordinates && (
              <FadeIn delay={0.3} className="relative mt-2">
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
              </FadeIn>
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
