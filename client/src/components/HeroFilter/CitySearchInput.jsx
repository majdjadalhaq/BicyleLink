import PropTypes from "prop-types";

/**
 * Clean and manageable City Search input with dropdown and GPS support.
 */
const CitySearchInput = ({
  citySearch,
  cityOptions,
  showCityDropdown,
  isLoadingLocation,
  onSearchChange,
  onFocus,
  onSelect,
  onUseGPS,
  dropdownRef,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">
        Location
      </label>

      <div className="relative w-full" ref={dropdownRef}>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="w-full px-3 py-2.5 bg-white dark:bg-dark-input border border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-200 transition-colors focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 placeholder-gray-400"
            placeholder="Enter city..."
            value={citySearch}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onFocus}
          />
          <button
            type="button"
            className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xl cursor-pointer transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:-translate-y-[1px] disabled:opacity-70 disabled:cursor-wait"
            onClick={onUseGPS}
            disabled={isLoadingLocation}
            title="Use my current location"
          >
            <span aria-hidden="true">{isLoadingLocation ? "⏳" : "📍"}</span>
          </button>
        </div>

        {showCityDropdown && cityOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-b-lg shadow-lg z-10 max-h-[200px] overflow-y-auto mt-1">
            {cityOptions.map((city, index) => (
              <div
                key={`${city.name}-${index}`}
                className="flex justify-between items-center w-full px-3 py-2.5 cursor-pointer border-b border-gray-50 dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-dark-input hover:text-emerald dark:hover:text-emerald-light"
                onClick={() => onSelect(city)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(city)}
              >
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {city.cleanName || city.name}
                </span>
                <span className="text-[0.75rem] text-gray-400 dark:text-gray-500 font-semibold bg-gray-100 dark:bg-dark-input px-1.5 py-0.5 rounded">
                  {city.countryCode}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

CitySearchInput.propTypes = {
  citySearch: PropTypes.string.isRequired,
  cityOptions: PropTypes.array.isRequired,
  showCityDropdown: PropTypes.bool.isRequired,
  isLoadingLocation: PropTypes.bool.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onUseGPS: PropTypes.func.isRequired,
  dropdownRef: PropTypes.object.isRequired,
};

export default CitySearchInput;
