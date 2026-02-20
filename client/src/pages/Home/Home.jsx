import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard.jsx";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
import HeroFilter from "../../components/HeroFilter/HeroFilter.jsx";

import TEST_ID from "./Home.testid";
import "../../styles/Home.css";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Advanced Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Construct query string including filters
  const buildQuery = () => {
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
  };

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/listings?${buildQuery()}`,
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

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Count active filters for badge
  const activeFilterCount = Object.keys(filters).filter((key) => {
    // Exclude geolocation metadata from being counted as separate filters
    if (["lat", "lng", "radius"].includes(key)) return false;

    const val = filters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (val === null || val === undefined || val === "") return false;
    return true;
  }).length;

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setIsFilterOpen(false); // Optional: close on apply
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="home-container" data-testid={TEST_ID.container}>
      <div className="home-hero">
        <h1>Find Your Perfect Ride</h1>
        <p>Browse quality second-hand bikes in your area</p>

        <div className="home-search-wrapper">
          <div className="home-search">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search by bike name, brand, or city..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <button
              className={`filter-toggle-btn ${isFilterOpen ? "active" : ""}`}
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
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>

          <HeroFilter
            isOpen={isFilterOpen}
            filters={filters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            onClearSearch={handleClearSearch}
          />
        </div>
      </div>

      {error && (
        <div className="home-error">
          Error loading listings: {error.toString()}
        </div>
      )}

      {isLoading && page === 1 && (
        <div className="listing-grid">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} type="card" />
          ))}
        </div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <div className="home-empty">
          {debouncedSearchTerm || Object.keys(filters).length > 0
            ? "No bikes found matching your search or filters."
            : "No bikes listed yet. Be the first to sell yours!"}
        </div>
      )}

      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>

      {hasMore && (
        <div className="home-pagination">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
