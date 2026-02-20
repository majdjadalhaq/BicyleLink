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
    <div className="filter-section">
      <label className="filter-title">Location</label>

      <div className="location-container" ref={dropdownRef}>
        <div className="location-input-row">
          <input
            type="text"
            className="styled-input"
            placeholder="Enter city..."
            value={citySearch}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onFocus}
          />
          <button
            type="button"
            className="gps-location-btn"
            onClick={onUseGPS}
            disabled={isLoadingLocation}
            title="Use my current location"
          >
            <span aria-hidden="true">{isLoadingLocation ? "⏳" : "📍"}</span>
          </button>
        </div>

        {showCityDropdown && cityOptions.length > 0 && (
          <div className="city-dropdown">
            {cityOptions.map((city, index) => (
              <div
                key={`${city.name}-${index}`}
                className="city-option"
                onClick={() => onSelect(city)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(city)}
              >
                <span className="city-name">{city.cleanName || city.name}</span>
                <span className="city-country">{city.countryCode}</span>
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
