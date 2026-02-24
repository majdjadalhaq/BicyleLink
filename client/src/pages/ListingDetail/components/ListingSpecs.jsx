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
    <div className="mb-10">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Specifications
      </h3>
      {activeSpecs.map((spec) => (
        <div key={spec.label} className="flex mb-2">
          <span className="w-[100px] font-semibold text-gray-500 dark:text-gray-400">
            {spec.label}:
          </span>
          <span className="text-gray-900 dark:text-gray-200">{spec.value}</span>
        </div>
      ))}
    </div>
  );
};

ListingSpecs.propTypes = {
  listing: PropTypes.object.isRequired,
};

export default ListingSpecs;
