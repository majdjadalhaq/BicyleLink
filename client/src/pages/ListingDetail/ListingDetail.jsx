import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import "../../styles/ListingDetail.css";
import FavoriteButton from "../../components/FavoriteButton";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import ReviewsList from "../../components/ReviewsList/ReviewsList";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [prevId, setPrevId] = useState(id);

  // Rating System States
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsListOpen, setReviewsListOpen] = useState(false);

  // Trigger to refresh reviews list
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);

  if (id !== prevId) {
    setPrevId(id);
    setActiveImageIndex(0);
  }

  const isOwner = user && listing && user?._id === listing.ownerId?._id;
  const isBuyer = user && listing && user?._id === listing.buyerId;

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

  // Fetch candidates when status modal opens
  useEffect(() => {
    if (statusModalOpen) {
      setIsLoadingCandidates(true);
      const token = localStorage.getItem("token");
      fetch(`/api/listings/${id}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCandidates(data.result);
          }
          setIsLoadingCandidates(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoadingCandidates(false);
        });
    }
  }, [statusModalOpen, id]);

  // Check if current user has already reviewed this listing
  useEffect(() => {
    if (user && id) {
      const token = localStorage.getItem("token");
      fetch(`/api/reviews/check?listingId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHasReviewed(data.hasReviewed);
          }
        })
        .catch((err) => console.error("Failed to check review status", err));
    }
  }, [id, user, reviewsRefreshTrigger]); // Re-check when reviews change

  const handleStatusClick = () => {
    if (listing.status === "active") {
      setStatusModalOpen(true);
    } else {
      // If sold, reactivate (simple toggle)
      handleStatusUpdate("active");
    }
  };

  const handleStatusUpdate = async (newStatus, buyerId = null) => {
    try {
      const token = localStorage.getItem("token");
      const body = { status: newStatus };
      if (buyerId) body.buyerId = buyerId;

      const res = await fetch(`/api/listings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setListing((prev) => ({
          ...prev,
          status: data.listing.status,
          buyerId: data.listing.buyerId,
        }));
        setStatusModalOpen(false);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const targetId = listing.ownerId?._id || listing.ownerId;

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetId,
          listingId: listing._id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Review submitted successfully!");
        setReviewModalOpen(false);
        setReviewsRefreshTrigger((prev) => prev + 1); // Trigger refresh
        setHasReviewed(true);
        setReviewsListOpen(true); // Open the list
      } else {
        alert(data.msg || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading)
    return <div className="listing-detail-container">Loading...</div>;
  if (error)
    return <div className="listing-detail-container">Error: {error}</div>;
  if (!listing) return null;

  // Handle price display logic
  let displayPrice = listing.price;
  if (listing.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  const currencySymbol = "€";
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["https://placehold.co/600x400?text=No+Image"];

  const nextImage = () =>
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="listing-detail-container">
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Left Column: Image Carousel */}
        <div className="carousel-container">
          <div className="main-image-wrapper">
            {images.length > 1 && (
              <button
                type="button"
                className="nav-arrow left"
                onClick={prevImage}
              >
                ‹
              </button>
            )}
            <img
              src={images[activeImageIndex]}
              alt={`${listing.title} - View ${activeImageIndex + 1}`}
              className="listing-main-image"
            />
            {images.length > 1 && (
              <button
                type="button"
                className="nav-arrow right"
                onClick={nextImage}
              >
                ›
              </button>
            )}
            {listing.status === "sold" && (
              <div className="sold-overlay">SOLD</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, index) => (
                <button
                  type="button"
                  key={index}
                  className={`thumbnail ${index === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

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

          <div className="listing-price">
            {currencySymbol}
            {displayPrice}
          </div>

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

            {/* Buyer Action: Rate Seller */}
            {isBuyer && listing.status === "sold" && !hasReviewed && (
              <button
                className="btn-rate-seller"
                onClick={() => setReviewModalOpen(true)}
              >
                ⭐ Rate Seller
              </button>
            )}
          </div>

          {/* Seller Info Section */}
          <div className="seller-info-section">
            <h3 className="seller-info-title">Seller Information</h3>
            <div className="seller-card">
              <div className="seller-avatar">
                {listing.ownerId?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="seller-details">
                <span className="seller-name">
                  {listing.ownerId?.name || "Unknown Seller"}
                </span>
                {listing.ownerId?.averageRating > 0 && (
                  <div
                    className="seller-rating-display"
                    onClick={() => setReviewsListOpen(true)}
                    role="button"
                    tabIndex={0}
                    title="Click to view all reviews"
                  >
                    <span className="star-icon">★</span>
                    <span className="rating-score">
                      {listing.ownerId.averageRating}
                    </span>
                    <span className="review-count">
                      See {listing.ownerId.reviewCount} reviews
                    </span>
                  </div>
                )}
                <span className="seller-email">Verified User</span>
              </div>
            </div>
          </div>

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
      {statusModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Mark as Sold</h3>
            <p>Who bought this item? select from your chats:</p>
            {isLoadingCandidates ? (
              <div>Loading buyers...</div>
            ) : (
              <div className="buyer-selection">
                <select
                  value={selectedBuyerId}
                  onChange={(e) => setSelectedBuyerId(e.target.value)}
                  className="buyer-select"
                >
                  <option value="">-- Select Buyer --</option>
                  {candidates.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                  <option value="other">Other / Sold Outside App</option>
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                disabled={!selectedBuyerId && selectedBuyerId !== "other"}
                onClick={() =>
                  handleStatusUpdate(
                    "sold",
                    selectedBuyerId === "other" ? null : selectedBuyerId,
                  )
                }
              >
                Confirm Sold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal for Buyer */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />

      {/* Reviews List for Viewing Seller Reviews */}
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
