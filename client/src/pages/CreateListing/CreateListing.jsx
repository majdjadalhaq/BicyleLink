import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import ListingForm from "../../components/ListingForm/ListingForm";
import "../../styles/CreateListing.css";
import TEST_ID from "./CreateListing.testid";

const CreateListing = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { isLoading, error, performFetch } = useFetch("/listings", (data) => {
    setSuccessMessage("Listing created successfully!");
    setErrorMessage("");
    const timer = setTimeout(() => {
      const listingId = data.listing?._id || data.result?._id;
      if (listingId) {
        navigate(`/listings/${listingId}`);
      } else {
        navigate("/");
      }
    }, 1500);
    return () => clearTimeout(timer);
  });

  const handleCreateSubmit = (formData) => {
    // The ListingForm handles the payload structure, but we wrap it in { listing: ... }
    // As per the API expectation seen in previous code
    performFetch({
      method: "POST",
      body: JSON.stringify({ listing: formData }), // ListingForm returns the flat data object
    });
  };

  return (
    <div className="create-listing-page" data-testid={TEST_ID.container}>
      <Link to="/" className="create-listing__back">
        ← Back to Marketplace
      </Link>

      <div className="create-listing-card">
        <header className="card-header-purple">
          <h1>Sell Your Bike</h1>
          <p>Your photos will now be saved directly to the database.</p>
        </header>

        <div className="card-body-content">
          {successMessage && (
            <div className="create-listing__success">{successMessage}</div>
          )}
          {(errorMessage || error) && (
            <div className="create-listing__error">
              {errorMessage ||
                (error && error.toString()) ||
                "Error creating listing."}
            </div>
          )}

          <ListingForm onSubmit={handleCreateSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
