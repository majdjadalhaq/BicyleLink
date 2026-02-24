import { useState, useEffect, useRef, useMemo } from "react";
import { City } from "country-state-city";
import FilterChips from "./FilterChips";
import RangeInputGroup from "./RangeInputGroup";
import CitySearchInput from "./CitySearchInput";
import useToast from "../../hooks/useToast";

// Strip common Dutch prefixes/suffixes to get clean city names
const cleanCityName = (name) => {
  return name
    .replace(/^Gemeente\s+/i, "")
    .replace(/\s+Stad$/i, "")
    .replace(/\s+Dorp$/i, "")
    .trim();
};

const HeroFilter = ({ filters, onApply, onClear, onClearSearch, isOpen }) => {
  // Local state for immediate UI feedback before applying
  const [localFilters, setLocalFilters] = useState(filters);
  const { showToast } = useToast();

  // City Search State
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const dropdownRef = useRef(null);

  // Sync local state when external filters change
  useEffect(() => {
    setLocalFilters(filters);
    setCitySearch(filters.location || "");
  }, [filters]);

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

  // Cache Dutch cities only
  const allCities = useMemo(
    () => City.getAllCities().filter((c) => c.countryCode === "NL"),
    [],
  );

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
    setLocalFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, brand: value ? [value] : [] }));
  };

  const handleCitySearchChange = (value) => {
    setCitySearch(value);

    if (value.length > 2) {
      const seen = new Set();
      const cities = allCities
        .map((c) => ({ ...c, cleanName: cleanCityName(c.name) }))
        .filter((c) => c.cleanName.toLowerCase().includes(value.toLowerCase()))
        .filter((c) => {
          if (seen.has(c.cleanName.toLowerCase())) return false;
          seen.add(c.cleanName.toLowerCase());
          return true;
        })
        .slice(0, 10);
      setCityOptions(cities);
      setShowCityDropdown(true);
    } else {
      setCityOptions([]);
      setShowCityDropdown(false);
    }

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
    const name = city.cleanName || cleanCityName(city.name);
    setCitySearch(name);
    setLocalFilters((prev) => ({
      ...prev,
      location: name,
      lat: city.latitude,
      lng: city.longitude,
    }));
    setShowCityDropdown(false);
  };

  const handleApply = () => {
    const filtersToApply = { ...localFilters };
    if (
      (filtersToApply.location || filtersToApply.lat || filtersToApply.lng) &&
      !filtersToApply.radius
    ) {
      filtersToApply.radius = 50;
    }
    if (filtersToApply.location && onClearSearch) {
      onClearSearch();
    }
    onApply(filtersToApply);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=nl`,
            { headers: { "User-Agent": "BikeBazaar-App/1.0" } },
          );

          if (!response.ok) throw new Error("Reverse geocoding failed");

          const data = await response.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county;

          if (city) {
            setCitySearch(city);
            setLocalFilters((prev) => ({
              ...prev,
              location: city,
              lat: latitude,
              lng: longitude,
            }));
            showToast(`Location set to ${city}`, "success");
          } else {
            showToast("Could not determine your city", "error");
          }
        } catch {
          showToast("Error getting location details", "error");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      () => {
        setIsLoadingLocation(false);
        showToast("Unable to retrieve your location", "error");
      },
    );
  };

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

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-[900px] bg-white dark:bg-dark-surface rounded-xl p-8 mt-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-dark-border flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col gap-6">
          <FilterChips
            title="Category"
            options={categories}
            selected={localFilters.category}
            onToggle={(val) => handleChipToggle("category", val)}
          />
          <FilterChips
            title="Condition"
            options={conditions}
            selected={localFilters.condition}
            onToggle={(val) => handleChipToggle("condition", val)}
          />
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">
              Brand
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-white dark:bg-dark-input border border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-200 transition-colors focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 placeholder-gray-400"
              placeholder="e.g. Trek, Specialized"
              value={localFilters.brand?.[0] || ""}
              onChange={handleBrandChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <RangeInputGroup
            title="Price Range"
            minKey="minPrice"
            maxKey="maxPrice"
            filters={localFilters}
            onChange={handleRangeChange}
          />
          <RangeInputGroup
            title="Year"
            minKey="minYear"
            maxKey="maxYear"
            filters={localFilters}
            onChange={handleRangeChange}
            minPlaceholder="2010"
            maxPlaceholder={new Date().getFullYear().toString()}
            minLabel="From"
            maxLabel="To"
          />

          <CitySearchInput
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Distance:
              </span>
              <div className="flex-1 relative h-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localFilters.radius || 50}
                  onChange={(e) =>
                    handleRangeChange("radius", Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-emerald"
                />
              </div>
              <span
                className="text-xs text-gray-500 dark:text-gray-400 font-medium"
                style={{ minWidth: "60px" }}
              >
                {localFilters.radius || 50} km
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-6 border-t border-gray-100 dark:border-dark-border">
        <button
          className="px-6 py-2.5 bg-transparent border border-gray-300 dark:border-dark-border text-gray-500 dark:text-gray-400 font-semibold rounded-full text-sm transition-colors hover:border-emerald hover:text-emerald dark:hover:text-emerald-light hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
          onClick={onClear}
        >
          Clear all filters
        </button>
        <button
          className="px-10 py-3 bg-gradient-to-r from-emerald-600 to-emerald tracking-wide text-white font-semibold rounded-full text-base transition-all shadow-lg shadow-emerald/30 hover:-translate-y-0.5 hover:shadow-emerald/40 active:translate-y-0"
          onClick={handleApply}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default HeroFilter;
