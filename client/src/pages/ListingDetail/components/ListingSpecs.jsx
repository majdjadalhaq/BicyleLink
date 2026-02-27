import PropTypes from "prop-types";

const SpecCard = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-[#10221C]/50 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-[#10B77F]/30 group">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#10B77F]/10 text-[#10B77F] flex items-center justify-center border border-[#10B77F]/20 group-hover:scale-110 transition-transform">
        {Icon}
      </div>
      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        {label}
      </span>
    </div>
    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
      {value}
    </span>
  </div>
);

SpecCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const ListingSpecs = ({ listing }) => {
  const specs = [
    {
      label: "Category",
      value: listing.category,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      label: "Year",
      value: listing.year,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: "Condition",
      value: listing.condition,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
    },
    {
      label: "Mileage",
      value: listing.mileage != null ? `${listing.mileage} km` : null,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      label: "Brand",
      value: listing.brand || null,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      label: "Model",
      value: listing.model || null,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
          <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
          <path d="M12 6V3" />
        </svg>
      ),
    },
  ];

  const activeSpecs = specs.filter((spec) => spec.value != null);

  if (activeSpecs.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xs font-black mb-4 text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2">
        Specifications
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {activeSpecs.map((spec) => (
          <SpecCard key={spec.label} {...spec} />
        ))}
      </div>
    </div>
  );
};

ListingSpecs.propTypes = {
  listing: PropTypes.object.isRequired,
};

export default ListingSpecs;
