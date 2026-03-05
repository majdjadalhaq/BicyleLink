import { useState, useEffect, useRef, useId, useCallback } from "react";
import useToast from "../../../hooks/useToast";

// Strip common Dutch prefixes/suffixes to get clean city names
const cleanCityName = (name) => {
  return name
    .replace(/^Gemeente\s+/i, "")
    .replace(/\s+Stad$/i, "")
    .replace(/\s+Dorp$/i, "")
    .trim();
};

export const useHeroFilter = ({ filters, onApply, idPrefix = "" }) => {
  const baseId = useId().replace(/:/g, "-");
  const uniquePrefix = idPrefix ? `${idPrefix}-` : `${baseId}-`;

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

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

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

  const handleChipToggle = useCallback((category, value) => {
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
  }, []);

  const handleRangeChange = useCallback((type, value) => {
    setLocalFilters((prev) => ({ ...prev, [type]: value }));
  }, []);

  const handleCitySearchChange = useCallback(
    (value) => {
      setCitySearch(value);

      if (value.length > 2) {
        const seen = new Set();
        const cities = allCities
          .map((c) => ({ ...c, cleanName: cleanCityName(c.name) }))
          .filter((c) =>
            c.cleanName.toLowerCase().includes(value.toLowerCase()),
          )
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
    },
    [allCities],
  );

  const handleCitySelect = useCallback((city) => {
    const name = city.cleanName || cleanCityName(city.name);
    setCitySearch(name);
    setLocalFilters((prev) => ({
      ...prev,
      location: name,
      lat: city.latitude,
      lng: city.longitude,
    }));
    setShowCityDropdown(false);
  }, []);

  const handleApply = useCallback(() => {
    const filtersToApply = { ...localFilters };
    if (
      (filtersToApply.location || filtersToApply.lat || filtersToApply.lng) &&
      !filtersToApply.radius
    ) {
      filtersToApply.radius = 50;
    }
    if (citySearch.trim() && !filtersToApply.lat && !filtersToApply.lng) {
      filtersToApply.location = citySearch.trim();
    }
    onApply(filtersToApply);
  }, [localFilters, citySearch, onApply]);

  const handleUseMyLocation = useCallback(() => {
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
  }, [showToast]);

  return {
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
  };
};
