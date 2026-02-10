import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "../../styles/CreateListing.css";
import TEST_ID from "./CreateListing.testid";

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "used",
    price: "",
    location: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    leaseDuration: "",
  });

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { isLoading, error, performFetch, cancelFetch } = useFetch("/listings", () => {
    setSuccessMessage("Listing created successfully!");
    const timer = setTimeout(() => {
      navigate("/");
    }, 1500);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
     return () => cancelFetch();
  }, [cancelFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Basic validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.location
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (formData.type === "lease" && !formData.leaseDuration) {
      setFormError("Lease duration is required for lease listings.");
      return;
    }

    // Prepare listing data
    const listingData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      price: Number(formData.price),
      location: formData.location,
      ownerId: "507f1f77bcf86cd799439011", // TODO: Replace with actual user ID from auth
    };

    // Add optional fields if provided
    if (formData.brand) listingData.brand = formData.brand;
    if (formData.model) listingData.model = formData.model;
    if (formData.year) listingData.year = Number(formData.year);
    if (formData.condition) listingData.condition = formData.condition;
    if (formData.type === "lease" && formData.leaseDuration) {
      listingData.leaseDuration = Number(formData.leaseDuration);
    }

    performFetch({
      method: "POST",
      body: JSON.stringify({ listing: listingData }),
    });
  };

  return (
    <div className="create-listing" data-testid={TEST_ID.container}>
      <Link to="/" className="create-listing__back">
        ← Back to Home
      </Link>

      <h1>Create New Listing</h1>

      <form onSubmit={handleSubmit} className="create-listing__form">
        {successMessage && (
          <div className="create-listing__success">{successMessage}</div>
        )}

        {(formError || error) && (
          <div className="create-listing__error">
            {formError || "Error creating listing. Please try again."}
          </div>
        )}

        <div className="create-listing__group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Mountain Bike"
            data-testid={TEST_ID.titleInput}
          />
        </div>

        <div className="create-listing__group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your bike..."
            rows={4}
            data-testid={TEST_ID.descriptionInput}
          />
        </div>

        <div className="create-listing__row">
          <div className="create-listing__group">
            <label htmlFor="type">Listing Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              data-testid={TEST_ID.typeSelect}
            >
              <option value="used">For Sale</option>
              <option value="lease">For Lease</option>
            </select>
          </div>

          <div className="create-listing__group">
            <label htmlFor="price">
              Price (€) {formData.type === "lease" ? "/month" : ""} *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              data-testid={TEST_ID.priceInput}
            />
          </div>
        </div>

        {formData.type === "lease" && (
          <div className="create-listing__group">
            <label htmlFor="leaseDuration">Lease Duration (months) *</label>
            <input
              type="number"
              id="leaseDuration"
              name="leaseDuration"
              value={formData.leaseDuration}
              onChange={handleChange}
              placeholder="e.g., 6"
              min="1"
            />
          </div>
        )}

        <div className="create-listing__group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Amsterdam"
            data-testid={TEST_ID.locationInput}
          />
        </div>

        <div className="create-listing__row">
          <div className="create-listing__group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Trek"
            />
          </div>

          <div className="create-listing__group">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Marlin 5"
            />
          </div>
        </div>

        <div className="create-listing__row">
          <div className="create-listing__group">
            <label htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g., 2022"
            />
          </div>

          <div className="create-listing__group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="create-listing__submit"
          disabled={isLoading}
          data-testid={TEST_ID.submitButton}
        >
          {isLoading ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
