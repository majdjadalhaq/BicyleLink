import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import ListingCard from "../../components/ListingCard";
import "../../styles/MyListings.css"; // We will create this

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);

  const { isLoading, error, performFetch } = useFetch(
    `/listings?ownerId=${user?._id}`,
    (response) => {
      setListings(response.result);
    },
  );

  useEffect(() => {
    if (user) {
      performFetch();
    }
  }, [user]);

  if (isLoading)
    return <div className="loading-state">Loading your bikes...</div>;
  if (error)
    return <div className="error-state">Error: {error.toString()}</div>;

  return (
    <div className="my-listings-page">
      <header className="my-listings-header">
        <h1>My Listings</h1>
        <Link to="/listing/create" className="btn-primary">
          + Sell a Bike
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="empty-state">
          <h2>You haven&apos;t listed any bikes yet.</h2>
          <p>Time to clear out the garage?</p>
          <Link to="/listing/create" className="btn-secondary">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              isOwnerView={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
