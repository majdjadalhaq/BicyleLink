import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "../../styles/ListingDetail.css";
import "../../styles/ListingDetail.css";

const ListingDetail = () => {
  /* Step 1: Initialize State */
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
  if (!listing) return null; // or a "Not Found" component

  // Handle price display logic locally
  let displayPrice = listing.price;
  if (listing.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  // Derive currency explicitly
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
      {/* Back Link */}
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Left Column: Image Carousel */}
        <div className="carousel-container">
          <div className="main-image-wrapper">
            {images.length > 1 && (
              <button
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
                className="nav-arrow right"
                onClick={nextImage}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, index) => (
                <button
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

        {/* Right Column: Details */}
        <div className="details-container">
          {listing.brand && <span className="brand-name">{listing.brand}</span>}

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
              <span className="badge badge-location">
                <span aria-hidden="true">📍</span> {listing.location}
              </span>
            )}
          </div>

          <div className="action-buttons">
            <button
              className="btn-contact"
              onClick={() => alert("Contact functionality coming soon!")}
            >
              Contact Seller
            </button>
            <button
              className="btn-favorite"
              onClick={() => alert("Added to favorites!")}
            >
              Add to Favorites
            </button>
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

        {/* Description Section */}
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
