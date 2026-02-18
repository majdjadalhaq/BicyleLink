import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard.jsx";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
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

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county;

          if (city) {
            setSearchTerm(city);
            setPage(1);
          } else {
            alert("Could not determine your city");
          }
        } catch (error) {
          console.error("Location error:", error);
          alert("Error getting location details");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoadingLocation(false);
        alert("Unable to retrieve your location");
      },
    );
  };

  return (
    <div className="home-container" data-testid={TEST_ID.container}>
      <div className="home-hero">
        <h1>Find Your Perfect Ride</h1>
        <p>Browse quality second-hand bikes in your area</p>

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
            className="btn-location"
            onClick={handleLocation}
            title="Use my location"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <span className="spinner">📍</span>
            ) : (
              <span>📍</span>
            )}
          </button>
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
