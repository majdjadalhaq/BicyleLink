import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { STAGGER } from "../../constants/design-tokens";
import { ListingCardSkeleton } from "../../components/ui/SkeletonLoaders.jsx";
import TEST_ID from "./Home.testid";
import { motion } from "framer-motion";

// Sub-components
import HomeHero from "./components/HomeHero.jsx";
import NoResults from "./components/NoResults.jsx";
import ListingGrid from "./components/ListingGrid.jsx";
import HomeSidebar from "./components/HomeSidebar.jsx";
import HomeMobileFilter from "./components/HomeMobileFilter.jsx";

import { useListings } from "../../hooks/useListings.js";

/* ─── Grid column detector ───────────────────────────────────────── */
const useGridCols = (gridRef) => {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    if (!gridRef.current) return;
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const colsStr = style.getPropertyValue("grid-template-columns");
      if (colsStr && colsStr !== "none") {
        setCols(colsStr.trim().split(/\s+/).length);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [gridRef]);
  return cols;
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
  } = useListings({
    ...filters,
    search: debouncedSearchTerm,
    sort,
  });

  const listings = useMemo(
    () => data?.pages.flatMap((page) => page.result) || [],
    [data],
  );

  const gridRef = useRef(null);
  const gridCols = useGridCols(gridRef);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setSort("");
  }, []);

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const activeFilterCount = Object.keys(filters).filter((key) => {
    if (["lat", "lng", "radius"].includes(key)) return false;
    const val = filters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (val === null || val === undefined || val === "") return false;
    return true;
  }).length;

  return (
    <div
      className="w-full min-h-screen bg-[#FAFAF8] dark:bg-[#121212] pb-24"
      data-testid={TEST_ID.container}
    >
      <HomeHero searchTerm={searchTerm} onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <HomeSidebar
            activeFilterCount={activeFilterCount}
            handleClearFilters={handleClearFilters}
            filters={filters}
            handleApplyFilters={handleApplyFilters}
          />

          <HomeMobileFilter
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filters={filters}
            handleApplyFilters={handleApplyFilters}
            handleClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />

          <div className="flex-1 min-w-0">
            {/* Results Title Area */}
            <div className="mb-6 mt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {debouncedSearchTerm
                      ? `Results for "${debouncedSearchTerm}"`
                      : activeFilterCount > 0
                        ? "Filtered Results"
                        : "Featured Bikes"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                    {listings.length > 0
                      ? `Showing ${listings.length} bike${listings.length !== 1 ? "s" : ""} currently available`
                      : "Finding the perfect bikes for you..."}
                  </p>
                </div>
                <label className="flex-shrink-0 flex items-center gap-2">
                  <span className="sr-only">Sort by</span>
                  <select
                    value={sort}
                    onChange={handleSortChange}
                    aria-label="Sort listings"
                    className="h-9 px-3 pr-8 text-xs font-bold bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-gray-700 dark:text-gray-300 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="year_desc">Newest Model Year</option>
                  </select>
                </label>
              </div>
            </div>

            {/* ── Listings Display ── */}
            <div className="relative min-h-[400px]">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-6 rounded-3xl text-center font-medium mb-10 shadow-sm">
                  Failed to load listings. Please check your connection and try
                  again.
                </div>
              )}

              {isLoading && listings.length === 0 && (
                <div
                  className="grid gap-5 mb-10 p-1"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                  }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`loading-skeleton-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * STAGGER.QUICK }}
                    >
                      <ListingCardSkeleton />
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && listings.length === 0 && !error ? (
                <NoResults
                  searchTerm={debouncedSearchTerm}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div ref={gridRef}>
                  <ListingGrid
                    listings={listings}
                    isLoading={isFetchingNextPage}
                    hasMore={hasNextPage}
                    onLoadMore={handleLoadMore}
                    gridCols={gridCols}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
