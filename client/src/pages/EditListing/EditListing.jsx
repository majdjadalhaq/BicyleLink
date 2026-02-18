import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import ListingForm from "../../components/ListingForm/ListingForm";
import "../../styles/CreateListing.css"; // Reuse shared styles

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Fetch Existing Listing Data
  const [listingData, setListingData] = useState(null);

  const {
    isLoading: isFetching,
    error: fetchError,
    performFetch: fetchListing,
  } = useFetch(`/listings/${id}`, (response) => {
    setListingData(response.result);
  });

  useEffect(() => {
    fetchListing();
  }, [id]);

  // 2. Fetch Hook for Updating
  const {
    isLoading: isUpdating,
    error: updateError,
    performFetch: performUpdate,
  } = useFetch(`/listings/${id}`, () => {
    setSuccessMessage("Listing updated successfully!");
    setErrorMessage("");
    setTimeout(() => {
      navigate(`/listings/${id}`); // Redirect back to detail
    }, 1500);
  });

  // 3. Security Check: Redirect if not owner
  useEffect(() => {
    if (listingData && user) {
      const ownerId = listingData.ownerId?._id || listingData.ownerId;
      if (ownerId && ownerId !== user._id) {
        // Not owner -> Redirect home
        navigate("/");
      }
    }
  }, [listingData, user, navigate]);

  const handleEditSubmit = (formData) => {
    performUpdate({
      method: "PUT",
      body: JSON.stringify({ listing: formData }),
    });
  };

  if (isFetching)
    return <div className="loading-fallback">Loading Listing...</div>;
  if (fetchError)
    return <div className="error-fallback">Error loading listing.</div>;

  return (
    <div className="create-listing-page">
      <Link to={`/listings/${id}`} className="create-listing__back">
        ← Back to Listing
      </Link>

      <div className="create-listing-card">
        <header className="card-header-purple">
          <h1>Edit Listing</h1>
          <p>Update your bike details.</p>
        </header>

        <div className="card-body-content">
          {successMessage && (
            <div className="create-listing__success">{successMessage}</div>
          )}
          {(errorMessage || updateError) && (
            <div className="create-listing__error">
              {errorMessage ||
                (updateError && updateError.toString()) ||
                "Error updating listing."}
            </div>
          )}

          {listingData && (
            <ListingForm
              initialValues={listingData}
              onSubmit={handleEditSubmit}
              isLoading={isUpdating}
              isEditMode={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditListing;
