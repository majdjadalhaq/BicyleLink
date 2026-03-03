import { useState, useEffect, useRef } from "react";
import FilterChips from "./FilterChips";
import DualRangeSlider from "../ui/DualRangeSlider";
import CitySearchInput from "./CitySearchInput";
import useToast from "../../hooks/useToast";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../../utils/constants";

// Strip common Dutch prefixes/suffixes to get clean city names
const cleanCityName = (name) => {
  return name
    .replace(/^Gemeente\s+/i, "")
    .replace(/\s+Stad$/i, "")
    .replace(/\s+Dorp$/i, "")
    .trim();
};

const HeroFilter = ({
  filters,
  onApply,
  onClear,
  onClearSearch,
  isOpen,
  isSidebar,
}) => {
  // Local state for immediate UI feedback before applying
  const [localFilters, setLocalFilters] = useState(filters);
  const { showToast } = useToast();

  // City Search State
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const dropdownRef = useRef(null);

  // Section visibility state
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    condition: true,
    price: false,
    year: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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

  // Dynamically load Dutch cities (keeps country-state-city in separate chunk)
  const [allCities, setAllCities] = useState([]);
  useEffect(() => {
    import("country-state-city").then(({ City }) => {
      setAllCities(City.getAllCities().filter((c) => c.countryCode === "NL"));
    });
  }, []);

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

  const currentYear = new Date().getFullYear();

  if (!isOpen && !isSidebar) return null;

  if (isSidebar) {
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
            <button
              type="button"
              onClick={() => toggleSection("category")}
              className="flex items-center justify-between w-full group pr-1"
            >
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
                Category
              </label>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform duration-300 ${expandedSections.category ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
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
            <button
              type="button"
              onClick={() => toggleSection("condition")}
              className="flex items-center justify-between w-full group pr-1"
            >
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
                Condition
              </label>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform duration-300 ${expandedSections.condition ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
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
              htmlFor="radius-slider"
              className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1"
            >
              Distance Range
            </label>
            <div className="flex items-center gap-4 px-1">
              <input
                id="radius-slider"
                name="radius-slider"
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
  }

  return (
    <div className="w-full max-w-[900px] bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 sm:p-8 mt-6 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-[#2a2a2a] flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => toggleSection("category")}
                  className="flex items-center justify-between w-full group"
                >
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
                    Category
                  </label>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-gray-400 transition-transform duration-300 ${expandedSections.category ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
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
                <button
                  type="button"
                  onClick={() => toggleSection("condition")}
                  className="flex items-center justify-between w-full group"
                >
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
                    Condition
                  </label>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-gray-400 transition-transform duration-300 ${expandedSections.condition ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
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
              htmlFor="radius-slider-desktop"
              className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
            >
              Distance Range
            </label>
            <div className="flex items-center gap-4 pt-2">
              <input
                id="radius-slider-desktop"
                name="radius-slider-desktop"
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

export default HeroFilter;
