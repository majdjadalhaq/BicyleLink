import PropTypes from "prop-types";

const FavoritesHeader = ({
  searchTerm,
  handleSearch,
  isFilterOpen,
  setIsFilterOpen,
  activeFilterCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          My Favorites
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          The bikes you&apos;ve loved and saved for later.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group flex-1 md:w-64">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
          />
        </div>

        {/* Mobile Filter Trigger */}
        <button
          title="Filter Favorites"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl border transition-all relative ${
            isFilterOpen || activeFilterCount > 0
              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
          }`}
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
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-emerald-500">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

FavoritesHeader.propTypes = {
  searchTerm: PropTypes.string,
  handleSearch: PropTypes.func.isRequired,
  isFilterOpen: PropTypes.bool.isRequired,
  setIsFilterOpen: PropTypes.func.isRequired,
  activeFilterCount: PropTypes.number.isRequired,
};

export default FavoritesHeader;
