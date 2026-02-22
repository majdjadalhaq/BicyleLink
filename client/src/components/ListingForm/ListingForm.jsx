import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import LocationMap from "../LocationMap";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../utils/config";
import "../../styles/CreateListing.css"; // We'll reuse the existing styles for now or refactor later

const CATEGORY_OPTIONS = [
  { value: "Road", label: "Road" },
  { value: "Mountain", label: "Mountain" },
  { value: "City", label: "City" },
  { value: "E-bike", label: "E-bike" },
  { value: "Gravel", label: "Gravel" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Kids", label: "Kids" },
  { value: "Fixed Gear", label: "Fixed Gear" },
  { value: "Cruiser", label: "Cruiser" },
  { value: "Other", label: "Other" },
];

const CONDITION_OPTIONS = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const ListingForm = ({
  initialValues,
  onSubmit,
  isLoading,
  isEditMode = false,
}) => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    category: "",
    images: [],
    coordinates: null,
  });

  const [previewCoords, setPreviewCoords] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        price: initialValues.price ? String(initialValues.price) : "",
        year: initialValues.year ? String(initialValues.year) : "",
        category: initialValues.category || "Other",
        condition: initialValues.condition || "good",
      }));
      if (initialValues.images && Array.isArray(initialValues.images)) {
        setExistingImages(initialValues.images);
      }
      if (initialValues.coordinates) {
        setPreviewCoords(initialValues.coordinates.coordinates);
      }
    }
  }, [initialValues]);

  // Debounced geocoding logic for text input
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only geocode if the location strictly changed and isn't empty
      if (formData.location && formData.location.length > 2) {
        try {
          const res = await fetch(
            `/api/utils/geocode?q=${encodeURIComponent(formData.location)}`,
          );
          const data = await res.json();
          if (data.success) {
            setPreviewCoords(data.result.coordinates);
            setFormData((prev) => ({ ...prev, coordinates: data.result }));
          }
        } catch (err) {
          console.error("Geocoding preview failed", err);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.location]);

  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newFiles]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `/api/utils/reverse-geocode?lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          if (data.success) {
            setFormData((prev) => ({
              ...prev,
              location: data.result,
              coordinates: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            }));
            setPreviewCoords([longitude, latitude]);
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert(
          "Could not detect your location. Please check browser permissions.",
        );
      },
      { timeout: 10000 },
    );
  };

  // Handler for when the user drags the pin on the map
  const handleMapLocationChange = async (newCoords) => {
    const [lng, lat] = newCoords;
    setPreviewCoords(newCoords);

    try {
      const res = await fetch(
        `/api/utils/reverse-geocode?lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          location: data.result,
          coordinates: { type: "Point", coordinates: newCoords },
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding after drag failed", err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    let errorMsg = "";

    const totalImages = existingImages.length + newFiles.length + files.length;
    if (totalImages > 5) {
      setFormError("You can only have a maximum of 5 images.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        errorMsg = `File ${file.name} is too large. Max 5MB allowed.`;
      } else {
        validFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    if (errorMsg) {
      setFormError(errorMsg);
      return;
    }

    setFormError("");
    setNewFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    const fileToRemove = newFiles[index];
    URL.revokeObjectURL(fileToRemove.previewUrl);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(url, { method: "POST", body: data });
    if (!response.ok) throw new Error("Image upload failed");
    const json = await response.json();
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.location ||
      !formData.category ||
      !formData.condition
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (existingImages.length === 0 && newFiles.length === 0) {
      setFormError("Please upload at least one image.");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        newFiles.map((item) => uploadImageToCloudinary(item.file)),
      );

      const finalImages = [...existingImages, ...uploadedUrls];

      const payload = {
        ...formData,
        price: Number(formData.price),
        year: formData.year ? Number(formData.year) : undefined,
        images: finalImages,
      };

      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      setFormError("Failed to upload images or save listing.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-listing__form">
      {formError && <div className="create-listing__error">{formError}</div>}

      <div className="create-listing__image-section">
        <label>Bike Photos * (Max 5)</label>
        <div className="image-gallery">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="gallery-item">
              <img src={url} alt={`Existing ${index}`} />
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => removeExistingImage(index)}
              >
                ×
              </button>
            </div>
          ))}

          {newFiles.map((item, index) => (
            <div key={`new-${index}`} className="gallery-item">
              <img src={item.previewUrl} alt={`New Preview ${index}`} />
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => removeNewFile(index)}
              >
                ×
              </button>
            </div>
          ))}

          {existingImages.length + newFiles.length < 5 && (
            <button
              type="button"
              className="add-image-trigger"
              onClick={() => fileInputRef.current?.click()}
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
          hidden
          multiple
          accept="image/*"
        />
      </div>

      <div className="create-listing__group">
        <InputField
          name="title"
          placeholder="Listing Title *"
          value={formData.title}
          onChange={(val) => handleChange("title", val)}
          required
        />
      </div>

      <div className="create-listing__group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your bike..."
          rows={5}
          className="form-textarea"
          required
        />
      </div>

      <div className="create-listing__grid">
        <InputField
          name="price"
          type="number"
          placeholder="Price (€) *"
          value={formData.price}
          onChange={(val) => handleChange("price", val)}
          min="0"
          required
        />

        <div className="location-input-group" style={{ position: "relative" }}>
          <InputField
            name="location"
            placeholder="Location *"
            value={formData.location}
            onChange={(val) => handleChange("location", val)}
            required
          />
          <button
            type="button"
            className="btn-use-location"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              background: "none",
              border: "none",
              color: "#7c3aed",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {isLocating ? "Locating..." : "📍 Use My Location"}
          </button>
        </div>

        <SelectField
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={(val) => handleChange("category", val)}
          options={CATEGORY_OPTIONS}
        />

        <SelectField
          name="condition"
          placeholder="Condition"
          value={formData.condition}
          onChange={(val) => handleChange("condition", val)}
          options={CONDITION_OPTIONS}
        />

        <InputField
          name="brand"
          placeholder="Brand"
          value={formData.brand}
          onChange={(val) => handleChange("brand", val)}
        />

        <InputField
          name="model"
          placeholder="Model"
          value={formData.model}
          onChange={(val) => handleChange("model", val)}
        />

        <InputField
          name="year"
          type="number"
          placeholder="Year"
          value={formData.year}
          onChange={(val) => handleChange("year", val)}
        />
      </div>

      {/* Seller Preview Map with Draggable Pin */}
      {previewCoords && (
        <div className="seller-preview-map">
          <p
            style={{
              fontSize: "0.85rem",
              color: "#64748b",
              marginBottom: "8px",
              fontWeight: "500",
            }}
          >
            🗺️ Location Preview (Drag the pin to set your listing&apos;s center)
          </p>
          <LocationMap
            coordinates={previewCoords}
            draggable={true}
            onLocationChange={handleMapLocationChange}
            title="Set Listing Location"
          />
        </div>
      )}

      <button
        type="submit"
        className="create-listing__submit"
        disabled={isLoading || isUploading}
      >
        {isUploading
          ? "Uploading..."
          : isLoading
            ? "Saving..."
            : isEditMode
              ? "Update Listing"
              : "Publish Listing"}
      </button>
    </form>
  );
};

ListingForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEditMode: PropTypes.bool,
};

export default ListingForm;
