import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import "../../styles/ListingDetail.css";
import FavoriteButton from "../../components/FavoriteButton";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setActiveImageIndex(0);
  }

  const isOwner = user && listing && user?._id === listing.ownerId?._id;

  const handleStatusUpdate = async (newStatus) => {
    // TODO: Implement status update logic
    console.log(`Updating status to ${newStatus}`);
  };

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
  }, [id]);

  if (loading)
    return <div className="listing-detail-container">Loading...</div>;
  if (error)
    return <div className="listing-detail-container">Error: {error}</div>;
  if (!listing) return null;

  // Handle price display
  let displayPrice = listing.price;
  if (listing.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  let currency = "EUR";
  if (
    listing.price &&
    typeof listing.price === "object" &&
    typeof listing.price.currency === "string"
  ) {
    currency = listing.price.currency;
  }

  const currencySymbol = currency === "USD" ? "$" : "€";

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["https://placehold.co/600x400?text=No+Image"];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
                aria-label="Previous image"
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
                aria-label="Next image"
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
                  aria-label={`View image ${index + 1}`}
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
                  onClick={() =>
                    handleStatusUpdate(
                      listing.status === "sold" ? "active" : "sold",
                    )
                  }
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

                {/* Only show Favorite button if not sold, or let it handle its own disabled state if preferred. 
                    User asked for "best UI", usually you can still fav a sold item, but if not, wrap in condition.
                    For now, I'll allow fav on sold items as a "wishlist" feature unless explicitly forbidden.
                */}
                <FavoriteButton listingId={listing._id} variant="button" />
              </>
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
    </div>
  );
};

export default ListingDetail;
