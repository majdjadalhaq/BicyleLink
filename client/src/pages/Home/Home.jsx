import { useEffect, useState, useMemo, lazy, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { ListingCardSkeleton } from "../../components/ui/SkeletonLoaders.jsx";
import TEST_ID from "./Home.testid";

const ListingCard = lazy(() => import("../../components/ListingCard.jsx"));
const HeroFilter = lazy(
  () => import("../../components/HeroFilter/HeroFilter.jsx"),
);

/* ─── Grid column detector ───────────────────────────────────────── */
const useGridCols = (gridRef) => {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    if (!gridRef.current) return;
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      // getComputedStyle gives us the actual repeat count
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

  const buildQuery = () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "12",
      search: debouncedSearchTerm || "",
    });
    if (filters.minPrice != null)
      params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice != null)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.minYear != null) params.set("minYear", String(filters.minYear));
    if (filters.maxYear != null) params.set("maxYear", String(filters.maxYear));

    const cats = filters.category?.length ? filters.category : [];
    if (cats.length) params.set("category", cats.join(","));

    if (filters.condition?.length)
      params.set("condition", filters.condition.join(","));
    if (filters.location) params.set("location", filters.location);
    if (filters.lat) params.set("lat", filters.lat);
    if (filters.lng) params.set("lng", filters.lng);
    if (filters.radius) params.set("radius", filters.radius);
    return params.toString();
  };

  const query = useMemo(buildQuery, [
    page,
    debouncedSearchTerm,
    filters.category,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.minYear,
    filters.maxYear,
    filters.location,
    filters.lat,
    filters.lng,
    filters.radius,
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const gridRef = useRef(null);
  const gridCols = useGridCols(gridRef);

  // Fetch listings when query changes
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/listings?${query}`, {
          method: "GET",
          headers: { "content-type": "application/json" },
          credentials: "include",
          signal,
        });
        const jsonResult = await res.json();

        if (!res.ok) {
          throw new Error(
            jsonResult.msg ||
              jsonResult.errors?.[0]?.message ||
              `Error: ${res.status} ${res.statusText}`,
          );
        }
        if (!jsonResult.success) {
          throw new Error(jsonResult.msg || "Request failed");
        }

        const { result, page: resPage, hasMore: resHasMore } = jsonResult;
        const isFirstPage = resPage === 1;
        if (isFirstPage) {
          setListings(result || []);
        } else {
          setListings((prev) => [...(prev || []), ...(result || [])]);
        }
        setHasMore(!!resHasMore);
      } catch (err) {
        if (err.name !== "AbortError") setError(err);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    };

    fetchListings();
    return () => controller.abort();
  }, [query]);

  const handleLoadMore = () => setPage((prev) => prev + 1);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };
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
    <div
      className="w-full min-h-screen bg-[#FAFAF8] dark:bg-[#121212] pb-24"
      data-testid={TEST_ID.container}
    >
      {/* Hero — full-bleed cycling image */}
      <div
        className="relative overflow-hidden text-white text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#FAFAF8] dark:from-gray-950/70 dark:via-gray-950/50 dark:to-[#121212]" />

        <div className="relative z-10 px-4 pt-14 pb-20 sm:pt-20 sm:pb-28 max-w-4xl mx-auto">
          <p className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-3">
            Pre-loved bicycle marketplace
          </p>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight leading-[1.1]">
            Every ride
            <br />
            <span className="text-emerald-400">starts here.</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg mb-10 max-w-lg mx-auto">
            Buy and sell quality second-hand bikes in your area. Road, mountain,
            city, e-bikes &amp; more.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <svg
                  width="18"
                  height="18"
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
              <label htmlFor="hero-search" className="sr-only">
                Search bikes, brands, and locations
              </label>
              <input
                id="hero-search"
                name="hero-search"
                type="text"
                placeholder="Search bikes, brands, locations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 text-sm sm:text-base rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all shadow-xl shadow-black/5 focus:bg-white/20 dark:focus:bg-white/15 focus:ring-4 focus:ring-[#10B77F]/10 focus:border-[#10B77F]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
            <div className="sticky top-[80px]">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] font-bold text-[#10B77F] hover:text-[#0EA572] transition-colors uppercase tracking-widest"
                  >
                    Reset
                  </button>
                )}
              </div>
              <Suspense
                fallback={
                  <div className="h-96 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />
                }
              >
                <HeroFilter
                  idPrefix="sidebar"
                  isOpen={true}
                  filters={filters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  onClearSearch={handleClearSearch}
                  isSidebar={true}
                />
              </Suspense>
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden bg-white dark:bg-[#121212] flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2a2a2a]">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">
                  Filters
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <HeroFilter
                  idPrefix="modal"
                  isOpen={true}
                  filters={filters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  onClearSearch={handleClearSearch}
                  isSidebar={true}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button (Sticky independently under the nav bar) */}
            <div className="md:hidden sticky top-[56px] z-50 bg-[#FAFAF8] dark:bg-[#121212] py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-100 dark:border-[#2a2a2a]/50 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all"
              >
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
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Section header */}
            <div className="mb-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {debouncedSearchTerm
                      ? `Results for "${debouncedSearchTerm}"`
                      : activeFilterCount > 0
                        ? "Filtered Results"
                        : "Featured Bikes"}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {listings.length > 0
                      ? `Showing ${listings.length} bike${listings.length !== 1 ? "s" : ""} available now`
                      : "No bikes found with current criteria"}
                  </p>
                </div>
              </div>
            </div>

            {/* Listings grid */}
            <div>
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center font-medium mb-6">
                  Error loading listings: {error.toString()}
                </div>
              )}

              {isLoading && page === 1 && (
                <div
                  className="grid gap-5 mb-6"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                  }}
                >
                  {[...Array(8)].map((_, i) => (
                    <ListingCardSkeleton key={`loading-skeleton-${i}`} />
                  ))}
                </div>
              )}

              {!isLoading && !error && listings.length === 0 && (
                <div className="text-center py-20 px-4">
                  <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-700">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {debouncedSearchTerm || activeFilterCount > 0
                      ? "No bikes match your search"
                      : "No bikes listed yet"}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
                    {debouncedSearchTerm || activeFilterCount > 0
                      ? "Try a different filter or search term."
                      : "Be the first to list your ride and kickstart the community!"}
                  </p>
                </div>
              )}

              <div
                ref={gridRef}
                className="grid gap-5 p-1"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                }}
              >
                <Suspense
                  fallback={
                    <>
                      {[...Array(8)].map((_, i) => (
                        <ListingCardSkeleton key={`lazy-skeleton-${i}`} />
                      ))}
                    </>
                  }
                >
                  {listings.map((listing, i) => {
                    const row = Math.floor(i / gridCols);
                    const col = i % gridCols;
                    return (
                      <motion.div
                        key={listing._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                        transition={{
                          duration: 0.55,
                          delay: row * 0.18 + col * 0.08,
                          ease: [0.2, 0.8, 0.2, 1],
                        }}
                        className="h-full"
                      >
                        <ListingCard listing={listing} />
                      </motion.div>
                    );
                  })}
                </Suspense>
              </div>

              {hasMore && (
                <div className="text-center mt-12 pb-32 sm:pb-8">
                  <button
                    className="px-10 py-3.5 bg-emerald-800 dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-glow disabled:opacity-50 transition-all active:scale-95"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      "Show More Bikes"
                    )}
                  </button>
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
