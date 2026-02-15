import { useEffect, useState, useMemo } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard.jsx";
import TEST_ID from "./Home.testid";
import "../../styles/Home.css";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/listings",
    (response) => {
      setListings(response.result);
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, []);

  // Filter Logic: Derived state using useMemo instead of useEffect
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const lowerTerm = searchTerm.toLowerCase();
      return (
        listing.title.toLowerCase().includes(lowerTerm) ||
        listing.location.toLowerCase().includes(lowerTerm) ||
        (listing.brand && listing.brand.toLowerCase().includes(lowerTerm))
      );
    });
  }, [searchTerm, listings]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

      {isLoading && (
        <div className="home-loading">Loading amazing bikes...</div>
      )}

      {!isLoading && !error && filteredListings.length === 0 && (
        <div className="home-empty">
          {listings.length === 0
            ? "No bikes listed yet. Be the first to sell yours!"
            : "No bikes found matching your search."}
        </div>
      )}

      <div className="listing-grid">
        {filteredListings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default Home;
