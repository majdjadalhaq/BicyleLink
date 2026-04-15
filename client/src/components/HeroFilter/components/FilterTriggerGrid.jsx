import PropTypes from "prop-types";

const FilterTriggerGrid = ({
  toggleSection,
  expandedSections,
  localFilters,
  currentYear,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {/* Category Trigger */}
      <button
        onClick={() => toggleSection("category")}
        className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group/btn ${
          expandedSections.category || localFilters.category?.length > 0
            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="text-[9px] font-black uppercase tracking-widest">
          Category
        </span>
      </button>

      {/* Condition Trigger */}
      <button
        onClick={() => toggleSection("condition")}
        className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group/btn ${
          expandedSections.condition || localFilters.condition?.length > 0
            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="text-[9px] font-black uppercase tracking-widest">
          Condition
        </span>
      </button>

      {/* Price Trigger */}
      <button
        onClick={() => toggleSection("price")}
        className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group/btn ${
          expandedSections.price ||
          localFilters.minPrice > 0 ||
          localFilters.maxPrice < 10000
            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
        }`}
      >
        <svg
          width="18"
          height="18"
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
        <span className="text-[9px] font-black uppercase tracking-widest">
          Price
        </span>
      </button>

      {/* Year Trigger */}
      <button
        onClick={() => toggleSection("year")}
        className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group/btn ${
          expandedSections.year ||
          localFilters.minYear > 1990 ||
          localFilters.maxYear < currentYear
            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
        }`}
      >
        <svg
          width="18"
          height="18"
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
        <span className="text-[9px] font-black uppercase tracking-widest">
          Year
        </span>
      </button>
    </div>
  );
};

FilterTriggerGrid.propTypes = {
  toggleSection: PropTypes.func.isRequired,
  expandedSections: PropTypes.object.isRequired,
  localFilters: PropTypes.object.isRequired,
  currentYear: PropTypes.number.isRequired,
};

export default FilterTriggerGrid;
