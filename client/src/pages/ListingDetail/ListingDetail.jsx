import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/ListingDetail.css";

const ListingDetail = () => {
  /* Step 1: Initialize State */
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Step 2: Fetch Data */
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`/api/listings/${id}`);
        setListing(response.data.result);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing details. Please try again later.");
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  /* Step 3: Handle Loading/Error States */
  if (loading)
    return <div className="listing-detail-container">Loading...</div>;
  if (error) return <div className="listing-detail-container">{error}</div>;
  if (!listing)
    return <div className="listing-detail-container">Listing not found</div>;

  /* Step 4: Render UI */
  return (
    <div className="listing-detail-container">
      {/* Back Link */}
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Left Column: Image */}
        <div className="image-container">
          <img
            src={
              listing.images && listing.images.length > 0
                ? listing.images[0]
                : "https://via.placeholder.com/600x400"
            }
            alt={listing.title}
            className="listing-image"
          />
        </div>

        {/* Right Column: Details */}
        <div className="details-container">
          {listing.brand && <span className="brand-name">{listing.brand}</span>}

          <h1 className="listing-title">{listing.title}</h1>
          <div className="listing-price">
            €
            {typeof listing.price === "object"
              ? listing.price.$numberDecimal || listing.price.value
              : listing.price}
          </div>

          <div className="badges">
            {listing.condition && (
              <span className="badge badge-condition">{listing.condition}</span>
            )}
            {listing.location && (
              <span className="badge badge-location">
                📍 {listing.location}
              </span>
            )}
          </div>

          <div className="action-buttons">
            <button className="btn-contact">Contact Seller</button>
            <button className="btn-favorite">Add to Favorites</button>
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
        <div className="description-section">
          <h3>Description</h3>
          <p className="description-text">{listing.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
