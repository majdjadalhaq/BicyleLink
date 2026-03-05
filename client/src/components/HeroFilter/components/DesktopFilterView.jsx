import PropTypes from "prop-types";
import FilterSectionTitle from "../sections/FilterSectionTitle";
import FilterChips from "../FilterChips";
import DualRangeSlider from "../../ui/DualRangeSlider";
import CitySearchInput from "../CitySearchInput";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../../../utils/constants";

const DesktopFilterView = ({
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
    <div className="w-full max-w-[900px] bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 sm:p-8 mt-6 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-[#2a2a2a] flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <FilterSectionTitle
                  title="Category"
                  name="category"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
                {expandedSections.category && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <FilterChips
                      title=""
                      options={CATEGORY_OPTIONS}
                      selected={localFilters.category}
                      onToggle={(val) => handleChipToggle("category", val)}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <FilterSectionTitle
                  title="Condition"
                  name="condition"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
                {expandedSections.condition && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <FilterChips
                      title=""
                      options={CONDITION_OPTIONS}
                      selected={localFilters.condition}
                      onToggle={(val) => handleChipToggle("condition", val)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Dual Range Side-by-Side Triggers */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => toggleSection("price")}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                expandedSections.price ||
                localFilters.minPrice > 0 ||
                localFilters.maxPrice < 10000
                  ? "bg-emerald-800 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-600 text-white shadow-glow"
                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
              }`}
            >
              <svg
                width="24"
                height="24"
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
              <span className="text-xs font-black uppercase tracking-widest">
                Price
              </span>
            </button>
            <button
              onClick={() => toggleSection("year")}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                expandedSections.year ||
                localFilters.minYear > 1990 ||
                localFilters.maxYear < currentYear
                  ? "bg-emerald-800 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-600 text-white shadow-glow"
                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
              }`}
            >
              <svg
                width="24"
                height="24"
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
              <span className="text-xs font-black uppercase tracking-widest">
                Year
              </span>
            </button>
          </div>

          {/* Collapsible Ranges */}
          {(expandedSections.price || expandedSections.year) && (
            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {expandedSections.price && (
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
              )}

              {expandedSections.year && (
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
              )}
            </div>
          )}

          <CitySearchInput
            id={`${uniquePrefix}city-search-desktop`}
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

          <div className="flex flex-col gap-4">
            <label
              htmlFor={`${uniquePrefix}radius-slider-desktop`}
              className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
            >
              Distance Range
            </label>
            <div className="flex items-center gap-4 pt-2">
              <input
                id={`${uniquePrefix}radius-slider-desktop`}
                name={`${uniquePrefix}radius-slider-desktop`}
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
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-6 border-t border-gray-100 dark:border-[#2a2a2a]">
        <button
          className="px-6 py-3 bg-transparent border border-gray-100 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-white/5 hover:text-emerald-500"
          onClick={onClear}
        >
          Clear all filters
        </button>
        <button
          className="px-10 py-3.5 bg-emerald-800 dark:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-glow active:scale-[0.98]"
          onClick={handleApply}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

DesktopFilterView.propTypes = {
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

export default DesktopFilterView;
