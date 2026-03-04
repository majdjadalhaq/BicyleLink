import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import BicycleLoading from "../../components/ui/BicycleLoading";
import { motion } from "framer-motion";

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

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      search: debouncedSearchTerm,
    });
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
    (data) => {
      setFavorites(data?.result || []);
    },
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

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
        {/* Desktop Sidebar Filters */}
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

        {/* Main Content */}
        <div className="flex-1">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                My Favorites
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                The bikes you&apos;ve loved and saved for later.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group flex-1 md:w-64">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                />
              </div>

              {/* Mobile Filter Trigger */}
              <button
                title="Filter Favorites"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl border transition-all relative ${
                  isFilterOpen || activeFilterCount > 0
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
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
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-emerald-500">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Filter Panel */}
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

          {/* Results Section */}
          <div className="relative">
            {isLoading && favorites.length === 0 && (
              <div className="py-20 flex items-center justify-center">
                <BicycleLoading message="Retrieving your collection..." />
              </div>
            )}

            {finalError && (
              <div className="max-w-md mx-auto bg-red-50 dark:bg-red-500/10 p-8 rounded-[2.5rem] text-center border border-red-100 dark:border-red-500/20">
                <div className="flex justify-center mb-4 text-red-500">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-6">
                  {finalError.toString()}
                </p>
                <button
                  onClick={loadFavorites}
                  className="px-8 py-3 bg-red-600 dark:bg-red-500 text-white rounded-2xl hover:bg-red-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!isLoading && !finalError && favorites.length === 0 && (
              <div className="py-20">
                <EmptyState
                  title={
                    debouncedSearchTerm || activeFilterCount > 0
                      ? "No matches found"
                      : "Your heart is empty"
                  }
                  message={
                    debouncedSearchTerm || activeFilterCount > 0
                      ? "Try adjusting your filters to find your favorites."
                      : "Discover amazing bikes and save them here by clicking the heart button."
                  }
                  icon={
                    debouncedSearchTerm || activeFilterCount > 0 ? (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    ) : (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
                        <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
                        <path d="M12 6V3" />
                      </svg>
                    )
                  }
                  actionLabel={
                    debouncedSearchTerm || activeFilterCount > 0
                      ? "Clear Filters"
                      : "Explore Marketplace"
                  }
                  actionLink={
                    debouncedSearchTerm || activeFilterCount > 0 ? null : "/"
                  }
                  onActionClick={
                    debouncedSearchTerm || activeFilterCount > 0
                      ? handleClearFilters
                      : null
                  }
                />
              </div>
            )}

            {!finalError && favorites.length > 0 && (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
              >
                {favorites.map((listing, i) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                    transition={{
                      duration: 0.8,
                      delay: (i % 8) * 0.1,
                      ease: [0.2, 0.8, 0.2, 1],
                    }}
                    className="relative group h-full"
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
