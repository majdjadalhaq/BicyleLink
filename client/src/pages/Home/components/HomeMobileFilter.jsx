import PropTypes from "prop-types";
import HeroFilter from "../../../components/HeroFilter/HeroFilter.jsx";

const HomeMobileFilter = ({
  isFilterOpen,
  setIsFilterOpen,
  filters,
  handleApplyFilters,
  handleClearFilters,
  activeFilterCount,
}) => {
  if (!isFilterOpen) {
    return (
      <div className="md:hidden sticky top-[64px] z-40 bg-[#FAFAF8] dark:bg-[#121212] py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-100 dark:border-[#2a2a2a]/50 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all"
        >
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
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
        onClick={() => setIsFilterOpen(false)}
      />
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[70] md:hidden bg-white dark:bg-[#121212] rounded-t-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
        {/* Horizontal Bar Handle */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />

        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 dark:border-[#2a2a2a]/50">
          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">
            Filters
          </h3>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
          <HeroFilter
            idPrefix="modal"
            isOpen={true}
            filters={filters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            isSidebar={true} // Mobile version uses sidebar layout inside modal
          />
        </div>
      </div>
    </>
  );
};

HomeMobileFilter.propTypes = {
  isFilterOpen: PropTypes.bool.isRequired,
  setIsFilterOpen: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  handleApplyFilters: PropTypes.func.isRequired,
  handleClearFilters: PropTypes.func.isRequired,
  activeFilterCount: PropTypes.number.isRequired,
};

export default HomeMobileFilter;
