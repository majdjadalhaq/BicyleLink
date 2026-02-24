import { Link } from "react-router-dom";
import "../../styles/ListingDetail.css";
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
    return <div className="listing-detail-container">Loading...</div>;
  if (error)
    return <div className="listing-detail-container">Error: {error}</div>;
  if (!listing) return null;

  const sellerData = {
    name: listing.ownerId?.name,
    averageRating: listing.ownerId?.averageRating ?? 0,
    reviewCount: listing.ownerId?.reviewCount ?? 0,
  };

  return (
    <div className="listing-detail-container">
      <Breadcrumbs
        items={[
          { label: "Listings", path: "/" },
          { label: listing.title, path: `/listings/${id}` },
        ]}
      />

      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        <ListingImageCarousel
          images={listing.images || []}
          title={listing.title}
          status={listing.status}
        />

        <div className="details-container">
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
            <LocationMap coordinates={listing.coordinates.coordinates} />
          )}
        </div>

        {listing.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p className="description-text">{listing.description}</p>
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
