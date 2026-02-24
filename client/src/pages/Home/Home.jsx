import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import useFetch from "../../hooks/useFetch";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
import TEST_ID from "./Home.testid";

const ListingCard = lazy(() => import("../../components/ListingCard.jsx"));
const HeroFilter = lazy(
  () => import("../../components/HeroFilter/HeroFilter.jsx"),
);

const Home = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page,
      limit: 12,
      search: debouncedSearchTerm,
    });
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minYear) params.append("minYear", filters.minYear);
    if (filters.maxYear) params.append("maxYear", filters.maxYear);
    if (filters.brand?.length) params.append("brand", filters.brand.join(","));
    if (filters.category?.length)
      params.append("category", filters.category.join(","));
    if (filters.condition?.length)
      params.append("condition", filters.condition.join(","));
    if (filters.location) params.append("location", filters.location);
    if (filters.lat) params.append("lat", filters.lat);
    if (filters.lng) params.append("lng", filters.lng);
    if (filters.radius) params.append("radius", filters.radius);
    return params.toString();
  }, [page, debouncedSearchTerm, filters]);

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/listings?${query}`,
    (response) => {
      if (page === 1) {
        setListings(response.result);
      } else {
        setListings((prev) => [...prev, ...response.result]);
      }
      setHasMore(response.hasMore);
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [page, debouncedSearchTerm, filters]);

  const handleLoadMore = () => setPage((prev) => prev + 1);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };
  const handleClearSearch = () => setSearchTerm("");
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setIsFilterOpen(false);
  };
  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const activeFilterCount = Object.keys(filters).filter((key) => {
    if (["lat", "lng", "radius"].includes(key)) return false;
    const val = filters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (val === null || val === undefined || val === "") return false;
    return true;
  }).length;

  return (
    <div className="w-full pb-12" data-testid={TEST_ID.container}>
      <div className="bg-gradient-to-br from-emerald-dark to-emerald text-white text-center px-4 py-16 sm:py-20 rounded-b-3xl shadow-lg shadow-emerald/30 mb-8 max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Find Your Perfect Ride
        </h1>
        <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto font-medium">
          Browse quality second-hand bikes in your area
        </p>

        <div className="max-w-3xl mx-auto flex flex-col items-center relative gap-3">
          <div className="w-full flex items-center gap-3 relative z-10">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by bike name, brand, or city..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-6 py-4 text-base sm:text-lg rounded-full border-0 shadow-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-light/40 transition-all text-gray-900 dark:text-white bg-white dark:bg-dark-surface placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <button
              className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-emerald-light/40 relative ${
                isFilterOpen
                  ? "bg-dark-surface text-emerald shadow-inner"
                  : "bg-white text-emerald hover:bg-gray-50 hover:-translate-y-0.5"
              }`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Advanced Filters"
              aria-label="Advanced Filters"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <Suspense
            fallback={
              <div className="h-2 w-full mt-4 bg-gray-200 dark:bg-dark-border animate-pulse rounded"></div>
            }
          >
            <HeroFilter
              isOpen={isFilterOpen}
              filters={filters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              onClearSearch={handleClearSearch}
            />
          </Suspense>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-center font-medium mb-6">
            Error loading listings: {error.toString()}
          </div>
        )}

        {isLoading && page === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} type="card" />
            ))}
          </div>
        )}

        {!isLoading && !error && listings.length === 0 && (
          <div className="text-center py-16 px-4 bg-gray-50 dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border mt-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              ></path>
            </svg>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {debouncedSearchTerm || Object.keys(filters).length > 0
                ? "No bikes found matching your search."
                : "No bikes listed yet."}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters, or be the first to sell yours!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Suspense
            fallback={
              <>
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={`lazy-skeleton-${i}`} type="card" />
                ))}
              </>
            }
          >
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </Suspense>
        </div>

        {hasMore && (
          <div className="text-center mt-12 pb-8">
            <button
              className="px-8 py-3 bg-emerald text-white font-semibold rounded-full shadow-md hover:bg-emerald-hover hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-emerald/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Bikes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
