import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import useToast from "../../hooks/useToast";
import "../../styles/ListingDetail.css";
import FavoriteButton from "../../components/FavoriteButton";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import ReviewsList from "../../components/ReviewsList/ReviewsList";
import ListingImageCarousel from "../../components/ListingImageCarousel/ListingImageCarousel";
import SellerCard from "../../components/SellerCard/SellerCard";
import MarkAsSoldModal from "./components/MarkAsSoldModal";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [listing, setListing] = useState(null);
  const [prevId, setPrevId] = useState(id);

  // Modal and selection state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsListOpen, setReviewsListOpen] = useState(false);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Reset when navigating between listings
  if (id !== prevId) {
    setListing(null);
    setPrevId(id);
  }

  const isOwner = user && listing && user?._id === listing.ownerId?._id;
  const isBuyer = user && listing && user?._id === listing.buyerId;
  const canRate = isBuyer && listing?.status === "sold" && !hasReviewed;
  const canViewReviews = (listing?.ownerId?.reviewCount ?? 0) > 0;

  const { execute: executeApi } = useApi();

  // Fetch listing details
  const {
    isLoading: loading,
    error,
    performFetch,
    cancelFetch,
  } = useFetch(`/listings/${id}`, (response) => {
    setListing(response.result);
  });

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [id, reviewsRefreshTrigger]);

  // Fetch candidate buyers when the status modal opens
  useEffect(() => {
    if (!statusModalOpen) return;

    const fetchCandidates = async () => {
      setIsLoadingCandidates(true);
      const data = await executeApi(`/api/listings/${id}/candidates`);
      if (data?.success) {
        setCandidates(data.result);
      }
      setIsLoadingCandidates(false);
    };

    fetchCandidates();
  }, [statusModalOpen, id]);

  // Check if the current user has already reviewed this listing
  useEffect(() => {
    if (!user || !id) return;

    const checkReview = async () => {
      const data = await executeApi(`/api/reviews/check?listingId=${id}`);
      if (data?.success) {
        setHasReviewed(data.hasReviewed);
      }
    };

    checkReview();
  }, [id, user, reviewsRefreshTrigger]);

  const handleStatusClick = () => {
    if (listing.status === "active") {
      setStatusModalOpen(true);
    } else {
      handleStatusUpdate("active");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const buyerId =
      newStatus === "sold" && selectedBuyerId !== "other"
        ? selectedBuyerId
        : null;

    const data = await executeApi(`/api/listings/${id}/status`, {
      method: "PATCH",
      body: { status: newStatus, ...(buyerId ? { buyerId } : {}) },
    });

    if (data?.success) {
      setListing((prev) => ({
        ...prev,
        status: data.listing.status,
        buyerId: data.listing.buyerId,
      }));
      setStatusModalOpen(false);
      showToast(`Listing marked as ${newStatus}`, "success");
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    setIsSubmittingReview(true);

    const targetId = listing.ownerId?._id || listing.ownerId;
    const data = await executeApi("/api/reviews", {
      method: "POST",
      body: { targetId, listingId: listing._id, rating, comment },
    });

    setIsSubmittingReview(false);

    if (data?.success) {
      setReviewModalOpen(false);
      setReviewsRefreshTrigger((prev) => prev + 1);
      setHasReviewed(true);
      setReviewsListOpen(true);
      showToast("Review submitted successfully", "success");
    } else {
      showToast(
        data?.msg || data?.errors?.[0]?.message || "Failed to submit review",
        "error",
      );
    }
  };

  if (loading)
    return <div className="listing-detail-container">Loading...</div>;
  if (error)
    return <div className="listing-detail-container">Error: {error}</div>;
  if (!listing) return null;

  let displayPrice = listing.price;
  if (listing.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  const sellerData = {
    name: listing.ownerId?.name,
    averageRating: listing.ownerId?.averageRating ?? 0,
    reviewCount: listing.ownerId?.reviewCount ?? 0,
  };

  return (
    <div className="listing-detail-container">
      <ToastContainer />
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Image Carousel */}
        <ListingImageCarousel
          images={listing.images || []}
          title={listing.title}
          status={listing.status}
        />

        {/* Details */}
        <div className="details-container">
          <div className="listing-header-top">
            {listing.brand && (
              <span className="brand-name">{listing.brand}</span>
            )}
            {listing.status === "sold" && (
              <span className="status-badge sold">Sold</span>
            )}
          </div>

          <h1 className="listing-title">{listing.title}</h1>

          <div className="listing-price">€{displayPrice}</div>

          <div className="badges">
            {listing.condition && (
              <span className="badge badge-condition">{listing.condition}</span>
            )}
            {listing.location && (
              <span className="badge badge-location">{listing.location}</span>
            )}
          </div>

          <div className="action-buttons">
            {isOwner ? (
              <>
                <button
                  className={`btn-status ${listing.status === "sold" ? "btn-undo" : "btn-sold"}`}
                  onClick={handleStatusClick}
                >
                  {listing.status === "sold" ? "Re-activate" : "Mark as Sold"}
                </button>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/listings/${id}/edit`)}
                >
                  Edit Listing
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-contact"
                  disabled={listing.status === "sold"}
                  onClick={() => {
                    if (!user) {
                      navigate("/login", {
                        state: { from: `/listings/${id}` },
                      });
                    } else {
                      const sellerId = listing.ownerId?._id || listing.ownerId;
                      navigate(`/chat/${id}?receiverId=${sellerId}`);
                    }
                  }}
                >
                  {listing.status === "sold" ? "Item Sold" : "Contact Seller"}
                </button>
                <FavoriteButton listingId={listing._id} variant="button" />
              </>
            )}
          </div>

          {/* Seller Card */}
          <SellerCard
            seller={sellerData}
            canRate={canRate}
            canViewReviews={canViewReviews}
            isSold={listing.status === "sold"}
            onRate={() => setReviewModalOpen(true)}
            onViewReviews={() => setReviewsListOpen(true)}
          />

          <div className="specs-section">
            <h3>Specifications</h3>
            {listing.brand && (
              <div className="spec-row">
                <span className="spec-label">Brand:</span>
                <span className="spec-value">{listing.brand}</span>
              </div>
            )}
            {listing.condition && (
              <div className="spec-row">
                <span className="spec-label">Condition:</span>
                <span className="spec-value">{listing.condition}</span>
              </div>
            )}
          </div>
        </div>

        {listing.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p className="description-text">{listing.description}</p>
          </div>
        )}
      </div>

      {/* Mark as Sold Modal */}
      <MarkAsSoldModal
        isOpen={statusModalOpen}
        candidates={candidates}
        isLoading={isLoadingCandidates}
        selectedBuyerId={selectedBuyerId}
        onBuyerChange={setSelectedBuyerId}
        onConfirm={() =>
          handleStatusUpdate(
            "sold",
            selectedBuyerId === "other" ? null : selectedBuyerId,
          )
        }
        onClose={() => setStatusModalOpen(false)}
      />

      {/* Review Modal for Buyer */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />

      {/* Reviews List for Seller */}
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
    </div>
  );
};

export default ListingDetail;
