import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ListingForm from "../../components/ListingForm/ListingForm";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [listingData, setListingData] = useState(null);

  const {
    execute: executeApi,
    isLoading: isFetching,
    error: fetchError,
  } = useApi();
  const {
    execute: executeUpdate,
    isLoading: isUpdating,
    error: updateError,
  } = useApi();

  useEffect(() => {
    const fetchListing = async () => {
      const response = await executeApi(`/listings/${id}`);
      if (response?.success) {
        setListingData(response.result);
      }
    };
    fetchListing();
  }, [id, executeApi]);

  useEffect(() => {
    if (listingData && user) {
      const ownerId = listingData.ownerId?._id || listingData.ownerId;
      if (ownerId && ownerId !== user._id && user.role !== "admin") {
        navigate("/");
      }
    }
  }, [listingData, user, navigate]);

  const handleEditSubmit = async (formData) => {
    const route =
      user?.role === "admin" ? `/admin/listings/${id}` : `/listings/${id}`;
    const data = await executeUpdate(route, {
      method: "PATCH",
      body: { listing: formData },
    });

    if (data?.success) {
      setSuccessMessage("Listing updated successfully!");
      setErrorMessage("");
      setTimeout(() => {
        navigate(
          user?.role === "admin" ? "/admin/listings" : `/listings/${id}`,
        );
      }, 1500);
    } else {
      setErrorMessage(data?.msg || "Error updating listing.");
    }
  };

  if (isFetching)
    return (
      <div className="text-center p-10 text-lg text-gray-900 dark:text-gray-100 font-medium">
        Loading Listing...
      </div>
    );
  if (fetchError)
    return (
      <div className="text-center p-10 text-lg text-red-600 dark:text-red-400 font-medium">
        Error loading listing.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-10 px-5 animate-in slide-in-from-bottom-2 duration-300">
      <Link
        to={`/listings/${id}`}
        className="inline-block mb-6 text-emerald font-semibold transition-transform hover:-translate-x-1 hover:text-emerald-hover"
      >
        ← Back to Listing
      </Link>

      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-dark-border">
        <header className="bg-gradient-to-r from-emerald to-teal-500 p-8 sm:p-10 text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-white drop-shadow-sm">
            Edit Listing
          </h1>
          <p className="text-emerald-50 text-base sm:text-lg m-0 opacity-90 font-medium">
            Update your bike details.
          </p>
        </header>

        <div className="p-6 sm:p-10 lg:p-12">
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl border-l-4 border-green-500 font-semibold mb-6 shadow-sm">
              {successMessage}
            </div>
          )}
          {(errorMessage || updateError) && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border-l-4 border-red-500 font-semibold mb-6 shadow-sm">
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
