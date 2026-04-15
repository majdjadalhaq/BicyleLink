import PropTypes from "prop-types";
import CitySearchInput from "../CitySearchInput";
import FilterTriggerGrid from "./FilterTriggerGrid";
import FilterContentArea from "./FilterContentArea";

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
      {/* Decorative Background */}
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

      <div className="flex flex-col gap-6 pb-24">
        <FilterTriggerGrid
          toggleSection={toggleSection}
          expandedSections={expandedSections}
          localFilters={localFilters}
          currentYear={currentYear}
        />

        <FilterContentArea
          expandedSections={expandedSections}
          localFilters={localFilters}
          handleChipToggle={handleChipToggle}
          handleRangeChange={handleRangeChange}
          currentYear={currentYear}
        />

        {/* Location Section */}
        <div className="flex flex-col gap-5 pt-2 border-t border-gray-100 dark:border-white/5">
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

          <div className="flex flex-col gap-3.5 px-0.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`${uniquePrefix}radius-slider`}
                className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                Distance Range
              </label>
              <span className="text-[9px] font-bold text-emerald-500">
                {localFilters.radius || 50} km
              </span>
            </div>
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
              className="w-full h-1 bg-gray-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
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
