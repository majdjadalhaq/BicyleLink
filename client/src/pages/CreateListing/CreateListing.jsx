import { useState } from "react";
import { useNavigate } from "react-router";
import useApi from "../../hooks/useApi";
import ListingForm from "../../components/ListingForm/ListingForm";
import TEST_ID from "./CreateListing.testid";

const CreateListing = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { execute: executeApi, isLoading, error } = useApi();

  const handleCreateSubmit = async (formData) => {
    const data = await executeApi("/listings", {
      method: "POST",
      body: { listing: formData },
    });

    if (data?.success) {
      setSuccessMessage("Listing created successfully!");
      setErrorMessage("");
      setTimeout(() => {
        const listingId = data.listing?._id || data.result?._id;
        if (listingId) {
          navigate(`/listings/${listingId}`);
        } else {
          navigate("/");
        }
      }, 1500);
    } else {
      setErrorMessage(data?.msg || "Error creating listing.");
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto py-10 px-5 animate-in slide-in-from-bottom-2 duration-300"
      data-testid={TEST_ID.container}
    >
      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-dark-border">
        <header className="bg-gradient-to-r from-emerald to-teal-500 p-8 sm:p-10 text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-white drop-shadow-sm">
            Sell Your Bike
          </h1>
          <p className="text-emerald-50 text-base sm:text-lg m-0 opacity-90 font-medium">
            Add photos, set a price, and find a buyer.
          </p>
        </header>

        <div className="p-6 sm:p-10 lg:p-12">
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl border-l-4 border-green-500 font-semibold mb-6 shadow-sm">
              {successMessage}
            </div>
          )}
          {(errorMessage || error) && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border-l-4 border-red-500 font-semibold mb-6 shadow-sm">
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
