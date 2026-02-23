import PropTypes from "prop-types";

const ListingHeader = ({ listing, isOwner }) => {
  return (
    <div className="listing-header">
      <div className="listing-header-top">
        {listing.brand && <span className="brand-name">{listing.brand}</span>}
        {listing.status === "sold" && (
          <span className="status-badge sold">Sold</span>
        )}
      </div>

      <h1 className="listing-title">{listing.title}</h1>

      {isOwner && (
        <div className="listing-analytics-bar">
          <div
            className="analytics-item"
            title="Unique views from potential buyers"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>{listing.views || 0} Views</span>
          </div>
          <div
            className="analytics-item"
            title="Unique buyers who messaged you"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>{listing.inquiries || 0} Inquiries</span>
          </div>
        </div>
      )}
    </div>
  );
};

ListingHeader.propTypes = {
  listing: PropTypes.object.isRequired,
  isOwner: PropTypes.bool,
};

export default ListingHeader;
