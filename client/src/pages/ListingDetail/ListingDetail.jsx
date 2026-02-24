import { Link } from "react-router-dom";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import ReviewsList from "../../components/ReviewsList/ReviewsList";
import ListingImageCarousel from "../../components/ListingImageCarousel/ListingImageCarousel";
import SellerCard from "../../components/SellerCard/SellerCard";
import Breadcrumbs from "../../components/Breadcrumbs";
import LocationMap from "../../components/LocationMap";
import MarkAsSoldModal from "./components/MarkAsSoldModal";

// Subcomponents
import ListingHeader from "./components/ListingHeader";
import ListingInfo from "./components/ListingInfo";
import ListingActions from "./components/ListingActions";
import ListingSpecs from "./components/ListingSpecs";
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
      <div className="max-w-6xl mx-auto p-5 text-gray-900 dark:text-gray-100">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="max-w-6xl mx-auto p-5 text-gray-900 dark:text-gray-100">
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
    <div className="max-w-6xl mx-auto p-5 text-gray-900 dark:text-gray-100 pb-16">
      <Breadcrumbs
        items={[
          { label: "Listings", path: "/" },
          { label: listing.title, path: `/listings/${id}` },
        ]}
      />

      <Link
        to="/"
        className="inline-block mb-6 text-emerald font-medium transition-transform hover:underline hover:-translate-x-1"
      >
        ← Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ListingImageCarousel
          images={listing.images || []}
          title={listing.title}
          status={listing.status}
        />

        <div className="flex flex-col">
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

          {listing.coordinates && listing.coordinates.coordinates && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
              <LocationMap coordinates={listing.coordinates.coordinates} />
            </div>
          )}
        </div>

        {listing.description && (
          <div className="md:col-span-2 bg-gray-50 dark:bg-dark-surface p-8 rounded-xl mt-4 border border-gray-100 dark:border-dark-border shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Description
            </h3>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}
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
    </div>
  );
};

export default ListingDetail;
