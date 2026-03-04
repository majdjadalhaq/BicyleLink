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
  id = "city-search",
}) => {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1"
      >
        Location
      </label>

      <div className="relative w-full" ref={dropdownRef}>
        <div className="flex gap-2 items-center">
          <input
            id={id}
            name={id}
            type="text"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-400 dark:placeholder-gray-600"
            placeholder="Enter city..."
            value={citySearch}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onFocus}
          />
          <button
            type="button"
            className="flex-shrink-0 w-[46px] h-[46px] flex items-center justify-center bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-xl cursor-pointer transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-70 disabled:cursor-wait active:scale-95 shadow-sm"
            onClick={onUseGPS}
            disabled={isLoadingLocation}
            title="Use my current location"
            aria-label="Use my current location"
          >
            <span
              aria-hidden="true"
              className="flex items-center justify-center"
            >
              {isLoadingLocation ? (
                <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
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
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              )}
            </span>
          </button>
        </div>

        {showCityDropdown && cityOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-xl z-20 max-h-[220px] overflow-y-auto mt-2 p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {cityOptions.map((city, index) => (
              <div
                key={`${city.name}-${index}`}
                className="flex justify-between items-center w-full px-4 py-3 cursor-pointer rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-[#1e1e1e] group"
                onClick={() => onSelect(city)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(city)}
              >
                <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {city.cleanName || city.name}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black bg-gray-100 dark:bg-[#2a2a2a] px-2 py-1 rounded-md uppercase tracking-tighter">
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
  id: PropTypes.string,
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
