import { Suspense, lazy } from "react";
import PropTypes from "prop-types";

const HeroFilter = lazy(() => import("../../../components/HeroFilter/HeroFilter.jsx"));

const HomeSidebar = ({
  activeFilterCount,
  handleClearFilters,
  filters,
  handleApplyFilters,
}) => {
  return (
    <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
      <div className="sticky top-[80px]">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-[#10B77F] hover:text-[#0EA572] transition-colors uppercase tracking-widest"
            >
              Reset
            </button>
          )}
        </div>
        <Suspense
          fallback={
            <div className="h-96 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />
          }
        >
          <HeroFilter
            idPrefix="sidebar"
            isOpen={true}
            filters={filters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            isSidebar={true}
          />
        </Suspense>
      </div>
    </aside>
  );
};

HomeSidebar.propTypes = {
  activeFilterCount: PropTypes.number.isRequired,
  handleClearFilters: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  handleApplyFilters: PropTypes.func.isRequired,
};

export default HomeSidebar;
