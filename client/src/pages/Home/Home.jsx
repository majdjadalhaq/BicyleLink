import {
  useEffect,
  useState,
  useMemo,
  lazy,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { ListingCardSkeleton } from "../../components/ui/SkeletonLoaders.jsx";
import TEST_ID from "./Home.testid";

// Sub-components
import HomeHero from "./components/HomeHero.jsx";
import NoResults from "./components/NoResults.jsx";
import ListingGrid from "./components/ListingGrid.jsx";

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

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setPage(1);
  }, []);

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
      {/* ── Hero Section ── */}
      <HomeHero searchTerm={searchTerm} onSearch={handleSearch} />

      {/* ── Main Content Area ── */}
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
                  isSidebar={true}
                />
              </Suspense>
            </div>
          </aside>

          {/* Mobile Filter Bottom Sheet */}
          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
                onClick={() => setIsFilterOpen(false)}
              />
              {/* Sheet */}
              <div className="fixed inset-x-0 bottom-0 z-[70] md:hidden bg-white dark:bg-[#121212] rounded-t-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
                {/* Horizontal Bar Handle */}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />

                <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 dark:border-[#2a2a2a]/50">
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
                  <HeroFilter
                    idPrefix="modal"
                    isOpen={true}
                    filters={filters}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                    isSidebar={true}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex-1 min-w-0">
            {/* Mobile Filter Trigger */}
            <div className="md:hidden sticky top-[64px] z-40 bg-[#FAFAF8] dark:bg-[#121212] py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-100 dark:border-[#2a2a2a]/50 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
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

            {/* Results Title Area */}
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
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                    {listings.length > 0
                      ? `Showing ${listings.length} bike${listings.length !== 1 ? "s" : ""} currently available`
                      : "Finding the perfect bikes for you..."}
                  </p>
                </div>
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

              {/* Initial Loading Skeletons */}
              {isLoading && page === 1 && (
                <div
                  className="grid gap-5 mb-10 p-1"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                  }}
                >
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`loading-skeleton-${i}`}
                      className="animate-in fade-in duration-500"
                    >
                      <ListingCardSkeleton />
                    </div>
                  ))}
                </div>
              )}

              {/* Grid or Empty State */}
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
                    isLoading={isLoading && page > 1}
                    hasMore={hasMore}
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
