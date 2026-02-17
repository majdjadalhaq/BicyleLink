import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard.jsx";
import TEST_ID from "./Home.testid";
import "../../styles/Home.css";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/listings?page=${page}&limit=12&search=${debouncedSearchTerm}`,
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
  }, [page, debouncedSearchTerm]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="home-container" data-testid={TEST_ID.container}>
      <div className="home-hero">
        <h1>Find Your Perfect Ride</h1>
        <p>Browse quality second-hand bikes in your area</p>

        <div className="home-search">
          <input
            type="text"
            placeholder="Search by bike name, brand, or city..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="home-error">
          Error loading listings: {error.toString()}
        </div>
      )}

      {isLoading && page === 1 && (
        <div className="home-loading">Loading amazing bikes...</div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <div className="home-empty">
          {debouncedSearchTerm
            ? "No bikes found matching your search."
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
