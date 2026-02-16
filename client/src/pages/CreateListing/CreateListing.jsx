import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "../../styles/CreateListing.css";
import TEST_ID from "./CreateListing.testid";

const CreateListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    images: [], // This will now store the Base64 strings to send to the server
  });

  const [previews, setPreviews] = useState([]); // Temporary Blob URLs for fast UI preview
  const [filesToUpload, setFilesToUpload] = useState([]); // Raw File objects to upload
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const conditionOptions = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  const { isLoading, error, performFetch } = useFetch("/listings", (data) => {
    setSuccessMessage("Listing created successfully!");
    setFormError("");
    const timer = setTimeout(() => {
      // Fix: Use data.listing._id instead of data.result._id to match API response
      const listingId = data.listing?._id || data.result?._id;
      if (listingId) {
        navigate(`/listings/${listingId}`);
      } else {
        navigate("/");
      }
    }, 1500);
    return () => clearTimeout(timer);
  });

  // Fix: Cleanup Blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCondition = (value) => {
    setFormData((prev) => ({ ...prev, condition: value }));
    setIsDropdownOpen(false);
    // Return focus to the trigger after selection for accessibility
    const trigger = dropdownRef.current?.querySelector(".dropdown-selected");
    if (trigger) trigger.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    } else if (e.key === "ArrowDown" && isDropdownOpen) {
      e.preventDefault();
      const firstOption =
        dropdownRef.current?.querySelector(".dropdown-option");
      firstOption?.focus();
    }
  };

  const handleOptionKeyDown = (e, value) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectCondition(value);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      e.target.nextElementSibling?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.target.previousElementSibling?.focus();
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      const trigger = dropdownRef.current?.querySelector(".dropdown-selected");
      if (trigger) trigger.focus();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Filter out huge files (e.g. > 5MB) - Cloudinary supports larger files but good to limit
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidSize) {
        setFormError(`File ${file.name} is too large. Max 5MB allowed.`);
      }
      return isValidSize;
    });

    if (validFiles.length < files.length) {
      return; // Stop if any file was invalid
    }

    if (previews.length + validFiles.length > 5) {
      setFormError("You can only upload a maximum of 5 images.");
      return;
    }

    setFormError("");

    // 1. Create immediate Blob URL previews for the UI
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // 2. Store the raw files to upload later
    setFilesToUpload((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (indexToRemove) => {
    // Cleanup the Blob URL
    URL.revokeObjectURL(previews[indexToRemove]);

    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    setFilesToUpload((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const uploadImageToCloudinary = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.location
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (filesToUpload.length === 0) {
      setFormError("Please upload at least one image of your bike.");
      return;
    }

    setIsUploading(true);

    try {
      // Upload all images to Cloudinary first
      const uploadPromises = filesToUpload.map((file) =>
        uploadImageToCloudinary(file),
      );
      const imageUrls = await Promise.all(uploadPromises);

      // Prepare exactly what the backend expects
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        images: imageUrls, // Now contains real Cloudinary URLs
      };

      if (formData.brand) listingData.brand = formData.brand;
      if (formData.model) listingData.model = formData.model;
      if (formData.year) listingData.year = Number(formData.year);
      if (formData.condition) listingData.condition = formData.condition;

      performFetch({
        method: "POST",
        body: JSON.stringify({ listing: listingData }),
      });
    } catch (err) {
      console.error("Upload error:", err);
      setFormError("Failed to upload images. Please check your connection.");
      setIsUploading(false); // Only stop loading on error, otherwise useFetch takes over
    }
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
          <form onSubmit={handleSubmit} className="create-listing__form">
            {successMessage && (
              <div className="create-listing__success">{successMessage}</div>
            )}
            {(formError || error) && (
              <div className="create-listing__error">
                {/* Fix: use error directly or toString method */}
                {formError ||
                  (error && error.toString()) ||
                  "Error creating listing."}
              </div>
            )}

            <div className="create-listing__image-section">
              <label>Bike Photos *</label>
              <div className="image-gallery">
                {previews.map((url, index) => (
                  <div key={index} className="gallery-item">
                    <img src={url} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {previews.length < 5 && (
                  <button
                    type="button"
                    className="add-image-trigger"
                    onClick={triggerFileInput}
                  >
                    <span className="plus-icon">+</span>
                    <span>Add Photo</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden-file-input"
                multiple
                accept="image/*"
              />
              <p className="input-hint">
                Maximum 5 photos. These will be encoded and saved.
              </p>
            </div>

            <div className="create-listing__group">
              <label htmlFor="title">Listing Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Silver Hybrid City Bike"
                required
              />
            </div>

            <div className="create-listing__group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Give your bike a great story..."
                rows={4}
                required
              />
            </div>

            <div className="create-listing__grid">
              <div className="create-listing__group">
                <label htmlFor="price">Price (€) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="500"
                  min="0"
                  required
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Amsterdam"
                  required
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Giant"
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
                  placeholder="e.g., Escape"
                />
              </div>

              <div className="create-listing__group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2015"
                />
              </div>

              <div className="create-listing__group">
                <label>Condition</label>
                <div className="custom-dropdown" ref={dropdownRef}>
                  <div
                    tabIndex="0"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-label="Select condition"
                    className={`dropdown-selected ${isDropdownOpen ? "open" : ""}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onKeyDown={handleKeyDown}
                  >
                    {formData.condition
                      ? conditionOptions.find(
                          (o) => o.value === formData.condition,
                        ).label
                      : "Select condition"}
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown-options" role="listbox">
                      {conditionOptions.map((option) => (
                        <div
                          key={option.value}
                          tabIndex="0"
                          role="option"
                          aria-selected={formData.condition === option.value}
                          className={`dropdown-option ${formData.condition === option.value ? "selected" : ""}`}
                          onClick={() => handleSelectCondition(option.value)}
                          onKeyDown={(e) =>
                            handleOptionKeyDown(e, option.value)
                          }
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="create-listing__submit"
              disabled={isLoading || isUploading}
            >
              {isUploading
                ? "Uploading Images..."
                : isLoading
                  ? "Saving Listing..."
                  : "Publish Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
