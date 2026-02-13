import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard.jsx";
import TEST_ID from "./Home.testid";
import "../../styles/Home.css";

const Home = () => {
  const [listings, setListings] = useState([]);
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

  return (
    <div className="home-container" data-testid={TEST_ID.container}>
      <div className="home-hero">
        <h1>Find Your Perfect Ride</h1>
        <p>Browse quality second-hand bikes in your area</p>
      </div>

      {error && (
        <div className="home-error">
          Error loading listings: {error.toString()}
        </div>
      )}

      {isLoading && (
        <div className="home-loading">Loading amazing bikes...</div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <div className="home-empty">
          <p>No bikes listed yet. Be the first to sell yours!</p>
        </div>
      )}

      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default Home;
