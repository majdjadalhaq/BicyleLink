import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ListingManagement.css";

const ListingManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/admin/listings");
      const data = await response.json();

      if (data.success) {
        setListings(data.listings);
      } else {
        setError(data.msg || "Failed to load listings");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleFeatured = async (id) => {
    try {
      const response = await fetch(`/api/admin/listings/${id}/featured`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (data.success) {
        setListings((prev) =>
          prev.map((l) =>
            l._id === id ? { ...l, isFeatured: data.listing.isFeatured } : l,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured status", err);
    }
  };

  const handleDeleteListing = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setListings((prev) => prev.filter((l) => l._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete listing", err);
    }
  };

  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ownerId?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading listings...</p>
      </div>
    );
  if (error)
    return (
      <div className="admin-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="listing-management">
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Listing Moderation</h1>
          <p className="admin-header__subtitle">
            Review and manage bike listings
          </p>
        </div>
      </header>

      <div className="admin-filters">
        <div className="admin-search-wrapper">
          <input
            type="text"
            placeholder="Search by title or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-listing">Listing</th>
              <th className="col-owner">Owner</th>
              <th className="col-price">Price</th>
              <th className="col-status">Status</th>
              <th className="col-featured">Type</th>
              <th className="col-created">Created</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map((listing) => (
              <tr key={listing._id}>
                <td className="col-listing">
                  <div className="listing-cell">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt=""
                        className="listing-thumb"
                      />
                    ) : (
                      <div className="listing-thumb-placeholder">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <div className="listing-info">
                      <Link
                        to={`/listings/${listing._id}`}
                        className="listing-link"
                      >
                        {listing.title}
                      </Link>
                      <span className="listing-category">
                        {listing.category}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="col-owner">
                  <Link
                    to={`/profile/${listing.ownerId?._id}`}
                    className="owner-link"
                  >
                    <div className="owner-cell">
                      <div
                        className={`avatar-mock avatar-${listing.ownerId?.name?.[0]?.toLowerCase() || "u"}`}
                      >
                        {listing.ownerId?.[0] ||
                          listing.ownerId?.name?.[0] ||
                          "U"}
                      </div>
                      <span className="owner-name">
                        {listing.ownerId?.name || "Unknown"}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="col-price">
                  <span className="price-tag">€{listing.price}</span>
                </td>
                <td className="col-status">
                  <span className={`status-badge status--${listing.status}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="col-featured">
                  <span
                    className={`type-badge type--${listing.isFeatured ? "featured" : "regular"}`}
                  >
                    {listing.isFeatured ? "★ Featured" : "Regular"}
                  </span>
                </td>
                <td className="col-created">
                  <div className="date-cell">
                    {new Date(listing.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="col-actions">
                  <div className="action-row">
                    <button
                      onClick={() => navigate(`/listings/${listing._id}/edit`)}
                      className="btn-action btn-edit"
                      title="Edit Listing"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(listing._id)}
                      className={`btn-action ${listing.isFeatured ? "btn-unfeature" : "btn-feature"}`}
                      title={
                        listing.isFeatured
                          ? "Remove from Featured"
                          : "Promote to Featured"
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="sr-only">
                        {listing.isFeatured ? "Unfeature" : "Feature"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      className="btn-action btn-delete"
                      title="Delete Listing"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListingManagement;
