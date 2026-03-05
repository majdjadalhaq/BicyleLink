import PropTypes from "prop-types";
import FilterSectionTitle from "../sections/FilterSectionTitle";
import DualRangeSlider from "../../ui/DualRangeSlider";
import CitySearchInput from "../CitySearchInput";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../../../utils/constants";

const SidebarFilterView = ({
  uniquePrefix,
  localFilters,
  citySearch,
  cityOptions,
  showCityDropdown,
  setShowCityDropdown,
  isLoadingLocation,
  dropdownRef,
  expandedSections,
  toggleSection,
  handleChipToggle,
  handleRangeChange,
  handleCitySearchChange,
  handleCitySelect,
  handleApply,
  handleUseMyLocation,
  onClear,
  currentYear,
}) => {
  return (
    <div className="flex flex-col gap-8 p-6 bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] shadow-sm glass-panel w-full relative group/sidebar overflow-hidden">
      {/* Bicycle Wheel Background Decorative Element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 border-[12px] border-emerald-500/5 dark:border-emerald-500/10 rounded-full pointer-events-none transition-transform duration-1000 group-hover/sidebar:rotate-45">
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-[1px] bg-emerald-500/5 dark:bg-emerald-500/10"
              style={{ transform: `rotate(${i * 22.5}deg)` }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-8 pb-20">
        {/* Categories */}
        <div className="flex flex-col gap-4">
          <FilterSectionTitle
            title="Category"
            name="category"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            groupClassName="pr-1"
          />
          {expandedSections.category && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleChipToggle("category", cat.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    localFilters.category?.includes(cat.value)
                      ? "bg-emerald-800 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-600 text-white shadow-glow"
                      : "bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-500/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Condition */}
        <div className="flex flex-col gap-4">
          <FilterSectionTitle
            title="Condition"
            name="condition"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            groupClassName="pr-1"
          />
          {expandedSections.condition && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {CONDITION_OPTIONS.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => handleChipToggle("condition", cond.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    localFilters.condition?.includes(cond.value)
                      ? "bg-emerald-800 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-600 text-white shadow-glow"
                      : "bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-500/30"
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <CitySearchInput
          id={`${uniquePrefix}city-search`}
          citySearch={citySearch}
          cityOptions={cityOptions}
          showCityDropdown={showCityDropdown}
          isLoadingLocation={isLoadingLocation}
          onSearchChange={handleCitySearchChange}
          onFocus={() => citySearch.length > 2 && setShowCityDropdown(true)}
          onSelect={handleCitySelect}
          onUseGPS={handleUseMyLocation}
          dropdownRef={dropdownRef}
        />

        {/* Distance Slider - Directly under Location */}
        <div className="flex flex-col gap-4 scroll-mt-20">
          <label
            htmlFor={`${uniquePrefix}radius-slider`}
            className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1"
          >
            Distance Range
          </label>
          <div className="flex items-center gap-4 px-1">
            <input
              id={`${uniquePrefix}radius-slider`}
              name={`${uniquePrefix}radius-slider`}
              type="range"
              min="0"
              max="200"
              value={localFilters.radius || 50}
              onChange={(e) =>
                handleRangeChange("radius", Number(e.target.value))
              }
              className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] font-bold text-emerald-500 min-w-12 text-right">
              {localFilters.radius || 50} km
            </span>
          </div>
        </div>

        {/* Dual Range Side-by-Side Triggers */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toggleSection("price")}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group/btn ${
              expandedSections.price ||
              localFilters.minPrice > 0 ||
              localFilters.maxPrice < 10000
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
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
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-widest">
              Price
            </span>
          </button>
          <button
            onClick={() => toggleSection("year")}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group/btn ${
              expandedSections.year ||
              localFilters.minYear > 1990 ||
              localFilters.maxYear < currentYear
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
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

        {/* Price Range Slider - Collapsible */}
        {expandedSections.price && (
          <div className="px-1 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <DualRangeSlider
              label="Price Range"
              min={0}
              max={10000}
              step={50}
              value={[
                localFilters.minPrice || 0,
                localFilters.maxPrice || 10000,
              ]}
              onChange={([min, max]) => {
                handleRangeChange("minPrice", min);
                handleRangeChange("maxPrice", max);
              }}
              formatValue={(v) => `€${v.toLocaleString()}`}
            />
          </div>
        )}

        {/* Year Range Slider - Collapsible */}
        {expandedSections.year && (
          <div className="px-1 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <DualRangeSlider
              label="Model Year"
              min={1990}
              max={currentYear}
              step={1}
              value={[
                localFilters.minYear || 1990,
                localFilters.maxYear || currentYear,
              ]}
              onChange={([min, max]) => {
                handleRangeChange("minYear", min);
                handleRangeChange("maxYear", max);
              }}
            />
          </div>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-t border-gray-100 dark:border-[#2a2a2a] rounded-b-3xl grid grid-cols-2 gap-3 z-10">
        <button
          onClick={onClear}
          className="py-3.5 rounded-2xl text-[10px] uppercase tracking-widest font-black text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-gray-100 dark:border-white/5 active:scale-95"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="py-3.5 bg-emerald-800 dark:bg-emerald-600 text-white rounded-2xl text-[10px] uppercase tracking-widest font-black shadow-glow active:scale-95 transition-all text-center"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

SidebarFilterView.propTypes = {
  uniquePrefix: PropTypes.string,
  localFilters: PropTypes.object,
  citySearch: PropTypes.string,
  cityOptions: PropTypes.array,
  showCityDropdown: PropTypes.bool,
  setShowCityDropdown: PropTypes.func,
  isLoadingLocation: PropTypes.bool,
  dropdownRef: PropTypes.object,
  expandedSections: PropTypes.object,
  toggleSection: PropTypes.func,
  handleChipToggle: PropTypes.func,
  handleRangeChange: PropTypes.func,
  handleCitySearchChange: PropTypes.func,
  handleCitySelect: PropTypes.func,
  handleApply: PropTypes.func,
  handleUseMyLocation: PropTypes.func,
  onClear: PropTypes.func,
  currentYear: PropTypes.number,
};

export default SidebarFilterView;
