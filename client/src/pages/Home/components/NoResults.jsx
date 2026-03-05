import { memo } from "react";
import PropTypes from "prop-types";

/**
 * NoResults Component
 * Shown when no listings match the current search or filters.
 */
const NoResults = ({ searchTerm, activeFilterCount, onClearFilters }) => {
  return (
    <div className="text-center py-20 px-4 animate-in fade-in duration-700">
      <div className="flex justify-center mb-6 text-gray-200 dark:text-gray-800">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v4M11 16h.01" />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
        {searchTerm || activeFilterCount > 0
          ? "No bikes match your search"
          : "No bikes listed yet"}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">
        {searchTerm || activeFilterCount > 0
          ? "We couldn't find any results for your current criteria. Try adjusting your filters or search term."
          : "Be the first to list your ride and kickstart the community!"}
      </p>

      {(searchTerm || activeFilterCount > 0) && (
        <button
          onClick={onClearFilters}
          className="px-8 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md active:scale-95 transition-all"
        >
          Reset all filters
        </button>
      )}
    </div>
  );
};

NoResults.propTypes = {
  searchTerm: PropTypes.string,
  activeFilterCount: PropTypes.number.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default memo(NoResults);
