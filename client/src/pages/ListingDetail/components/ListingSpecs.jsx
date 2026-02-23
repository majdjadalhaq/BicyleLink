import PropTypes from "prop-types";

const ListingSpecs = ({ listing }) => {
  const specs = [
    { label: "Brand", value: listing.brand },
    { label: "Model", value: listing.model },
    { label: "Category", value: listing.category },
    { label: "Year", value: listing.year },
    { label: "Condition", value: listing.condition },
    {
      label: "Mileage",
      value: listing.mileage != null ? `${listing.mileage} km` : null,
    },
  ];

  const activeSpecs = specs.filter((spec) => spec.value != null);

  if (activeSpecs.length === 0) return null;

  return (
    <div className="specs-section">
      <h3>Specifications</h3>
      {activeSpecs.map((spec) => (
        <div key={spec.label} className="spec-row">
          <span className="spec-label">{spec.label}:</span>
          <span className="spec-value">{spec.value}</span>
        </div>
      ))}
    </div>
  );
};

ListingSpecs.propTypes = {
  listing: PropTypes.object.isRequired,
};

export default ListingSpecs;
