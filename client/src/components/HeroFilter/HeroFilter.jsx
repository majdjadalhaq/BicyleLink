import { useState, useEffect, useRef, useMemo } from "react";
import "./HeroFilter.css";
import { City } from "country-state-city";

const HeroFilter = ({ filters, onApply, onClear, facets, isOpen }) => {
  // Local state for immediate UI feedback before applying
  const [localFilters, setLocalFilters] = useState(filters);

  // City Search State
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sync local state when external filters change (e.g. cleared)
  // Intentional: syncing prop changes to local state
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLocalFilters(filters);
    if (filters.location) {
      setCitySearch(filters.location);
    } else {
      setCitySearch("");
    }
  }, [filters]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cache all cities to avoid calling getAllCities() on every keystroke
  const allCities = useMemo(() => City.getAllCities(), []);

  const handleChipToggle = (category, value) => {
    setLocalFilters((prev) => {
      const current = prev[category] || [];
      const isSelected = current.includes(value);
      if (isSelected) {
        return {
          ...prev,
          [category]: current.filter((item) => item !== value),
        };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const handleRangeChange = (type, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({
      ...prev,
      brand: value ? [value] : [],
    }));
  };

  const handleCitySearchChange = (e) => {
    const value = e.target.value;
    setCitySearch(value);

    if (value.length > 2) {
      // Filter cities - limiting to 10 for performance
      const cities = allCities
        .filter((c) => c.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setCityOptions(cities);
      setShowCityDropdown(true);
    } else {
      setCityOptions([]);
      setShowCityDropdown(false);
    }

    // Clear location if input is cleared
    if (value === "") {
      setLocalFilters((prev) => ({
        ...prev,
        location: "",
        lat: null,
        lng: null,
      }));
    }
  };

  const handleCitySelect = (city) => {
    setCitySearch(city.name);
    setLocalFilters((prev) => ({
      ...prev,
      location: city.name,
      lat: city.latitude,
      lng: city.longitude,
    }));
    setShowCityDropdown(false);
  };

  const handleApply = () => {
    const filtersToApply = { ...localFilters };
    // Ensure default radius matches UI if location is set but radius untouched
    if (
      (filtersToApply.location || filtersToApply.lat || filtersToApply.lng) &&
      !filtersToApply.radius
    ) {
      filtersToApply.radius = 50;
    }
    onApply(filtersToApply);
  };

  // Safe default for facets in case fetching fails or is slow
  // Use static categories from backend model to ensure options always appear
  const categories = [
    "Road",
    "Mountain",
    "City",
    "E-bike",
    "Gravel",
    "Hybrid",
    "Kids",
    "Fixed Gear",
    "Cruiser",
    "Other",
  ];
  const conditions = [
    { label: "New", value: "new" },
    { label: "Like New", value: "like-new" },
    { label: "Good", value: "good" },
    { label: "Fair", value: "fair" },
    { label: "Poor", value: "poor" },
  ];

  const minPriceLimit = facets?.minPrice || 0;
  const maxPriceLimit = facets?.maxPrice || 10000;

  if (!isOpen) return null;

  return (
    <div className="hero-filter-container">
      <div className="filter-grid">
        {/* Left Column: Categories, Condition, Brand */}
        <div className="filter-column">
          {/* Category Section */}
          <div className="filter-section">
            <label className="filter-title">Category</label>
            <div className="filter-chips">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`filter-chip ${
                    localFilters.category?.includes(cat) ? "active" : ""
                  }`}
                  onClick={() => handleChipToggle("category", cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Condition Section */}
          <div className="filter-section">
            <label className="filter-title">Condition</label>
            <div className="filter-chips">
              {conditions.map((cond) => (
                <div
                  key={cond.value}
                  className={`filter-chip ${
                    localFilters.condition?.includes(cond.value) ? "active" : ""
                  }`}
                  onClick={() => handleChipToggle("condition", cond.value)}
                >
                  {cond.label}
                </div>
              ))}
            </div>
          </div>

          {/* Brand Section */}
          <div className="filter-section">
            <label className="filter-title">Brand</label>
            <input
              type="text"
              className="styled-input"
              placeholder="e.g. Trek, Specialized"
              value={localFilters.brand?.[0] || ""}
              onChange={handleBrandChange}
            />
          </div>
        </div>

        {/* Right Column: Price, Year, Location */}
        <div className="filter-column">
          {/* Price Range */}
          <div className="filter-section">
            <label className="filter-title">Price Range</label>
            <div className="range-group">
              <div className="range-input-wrapper">
                <span className="range-label">Min</span>
                <input
                  type="number"
                  className="styled-input"
                  placeholder={minPriceLimit}
                  value={localFilters.minPrice || ""}
                  onChange={(e) =>
                    handleRangeChange("minPrice", Number(e.target.value))
                  }
                />
              </div>
              <div className="range-input-wrapper">
                <span className="range-label">Max</span>
                <input
                  type="number"
                  className="styled-input"
                  placeholder={maxPriceLimit}
                  value={localFilters.maxPrice || ""}
                  onChange={(e) =>
                    handleRangeChange("maxPrice", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Year Range */}
          <div className="filter-section">
            <label className="filter-title">Year</label>
            <div className="range-group">
              <div className="range-input-wrapper">
                <span className="range-label">From</span>
                <input
                  type="number"
                  className="styled-input"
                  placeholder="2010"
                  value={localFilters.minYear || ""}
                  onChange={(e) =>
                    handleRangeChange("minYear", Number(e.target.value))
                  }
                />
              </div>
              <div className="range-input-wrapper">
                <span className="range-label">To</span>
                <input
                  type="number"
                  className="styled-input"
                  placeholder={new Date().getFullYear()}
                  value={localFilters.maxYear || ""}
                  onChange={(e) =>
                    handleRangeChange("maxYear", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Location & Distance */}
          <div className="filter-section">
            <label className="filter-title">Location</label>

            <div className="location-container" ref={dropdownRef}>
              <input
                type="text"
                className="styled-input"
                placeholder="Enter city..."
                value={citySearch}
                onChange={handleCitySearchChange}
                onFocus={() =>
                  citySearch.length > 2 && setShowCityDropdown(true)
                }
              />

              {showCityDropdown && cityOptions.length > 0 && (
                <div className="city-dropdown">
                  {cityOptions.map((city, index) => (
                    <div
                      key={`${city.name}-${index}`}
                      className="city-option"
                      onClick={() => handleCitySelect(city)}
                    >
                      <span className="city-name">{city.name}</span>
                      <span className="city-country">{city.countryCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="slider-wrapper">
              <span className="range-label">Distance:</span>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localFilters.radius || 50}
                  onChange={(e) =>
                    handleRangeChange("radius", Number(e.target.value))
                  }
                  className="styled-range"
                  style={{
                    background: `linear-gradient(to right, #6a1b9a 0%, #6a1b9a ${
                      localFilters.radius || 50
                    }%, #e9ecef ${localFilters.radius || 50}%, #e9ecef 100%)`,
                  }}
                />
              </div>
              <span className="range-label" style={{ minWidth: "60px" }}>
                {localFilters.radius || 50} km
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-actions">
        <button className="clear-btn" onClick={onClear}>
          Clear all filters
        </button>
        <button className="apply-btn" onClick={handleApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default HeroFilter;
