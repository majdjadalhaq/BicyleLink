import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import useFetch from "../../hooks/useFetch";
import FavoritesHeader from "./components/FavoritesHeader";
import FavoritesResults from "./components/FavoritesResults";

const HeroFilter = lazy(
  () => import("../../components/HeroFilter/HeroFilter.jsx"),
);

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [localError, setLocalError] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ search: debouncedSearchTerm });
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minYear) params.append("minYear", filters.minYear);
    if (filters.maxYear) params.append("maxYear", filters.maxYear);
    if (filters.category?.length)
      params.append("category", filters.category.join(","));
    if (filters.condition?.length)
      params.append("condition", filters.condition.join(","));
    if (filters.location) params.append("location", filters.location);
    if (filters.lat) params.append("lat", filters.lat);
    if (filters.lng) params.append("lng", filters.lng);
    if (filters.radius) params.append("radius", filters.radius);
    return params.toString();
  }, [debouncedSearchTerm, filters]);

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/favorites?${query}`,
    (data) => setFavorites(data?.result || []),
  );

  const loadFavorites = async () => {
    setLocalError("");
    try {
      await performFetch();
    } catch (err) {
      console.error(err);
      setLocalError("Failed to load favorites");
    }
  };

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [query]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const activeFilterCount = Object.keys(filters).filter((key) => {
    if (["lat", "lng", "radius"].includes(key)) return false;
    const val = filters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (val === null || val === undefined || val === "") return false;
    return true;
  }).length;

  const finalError = localError || error;

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 py-10">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24 h-[calc(100vh-120px)]">
            <Suspense
              fallback={
                <div className="h-full w-full bg-gray-50 dark:bg-white/5 animate-pulse rounded-3xl" />
              }
            >
              <HeroFilter
                isSidebar={true}
                filters={filters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </Suspense>
          </div>
        </aside>

        <div className="flex-1">
          <FavoritesHeader
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            activeFilterCount={activeFilterCount}
          />

          {isFilterOpen && (
            <div className="lg:hidden mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
              <Suspense
                fallback={
                  <div className="h-64 w-full bg-gray-50 dark:bg-white/5 animate-pulse rounded-3xl" />
                }
              >
                <HeroFilter
                  isOpen={true}
                  filters={filters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  onClearSearch={() => setSearchTerm("")}
                />
              </Suspense>
            </div>
          )}

          <div className="relative">
            <FavoritesResults
              isLoading={isLoading}
              error={finalError}
              favorites={favorites}
              debouncedSearchTerm={debouncedSearchTerm}
              activeFilterCount={activeFilterCount}
              handleClearFilters={handleClearFilters}
              loadFavorites={loadFavorites}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
