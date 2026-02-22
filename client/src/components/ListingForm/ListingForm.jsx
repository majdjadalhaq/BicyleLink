import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import LocationMap from "../LocationMap";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../utils/config";
import "../../styles/CreateListing.css";

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

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;

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

  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [formError, setFormError] = useState("");

  // Derive preview coords from formData — no redundant state
  const previewCoords = formData.coordinates?.coordinates ?? null;

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
      if (Array.isArray(initialValues.images)) {
        setExistingImages(initialValues.images);
      }
    }
  }, [initialValues]);

  // Debounced geocoding — fires 1.5s after user stops typing a location
  useEffect(() => {
    if (!formData.location || formData.location.length <= 2) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/utils/geocode?q=${encodeURIComponent(formData.location)}`,
        );
        const data = await res.json();
        if (data.success) {
          setFormData((prev) => ({ ...prev, coordinates: data.result }));
        }
      } catch (err) {
        console.error("Geocoding preview failed", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.location]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newFiles]);

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
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
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          setFormError("Could not resolve your location address.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        setFormError(
          "Could not detect your location. Check browser permissions.",
        );
      },
      { timeout: 10000 },
    );
  }, []);

  const handleMapLocationChange = useCallback(async (newCoords) => {
    const [lng, lat] = newCoords;
    setFormData((prev) => ({
      ...prev,
      coordinates: { type: "Point", coordinates: newCoords },
    }));

    try {
      const res = await fetch(
        `/api/utils/reverse-geocode?lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, location: data.result }));
      }
    } catch (err) {
      console.error("Reverse geocoding after drag failed", err);
    }
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);

      if (existingImages.length + newFiles.length + files.length > MAX_IMAGES) {
        setFormError(`You can only have a maximum of ${MAX_IMAGES} images.`);
        return;
      }

      let errorMsg = "";
      const validFiles = [];

      files.forEach((file) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          errorMsg = `"${file.name}" is too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`;
        } else {
          validFiles.push({ file, previewUrl: URL.createObjectURL(file) });
        }
      });

      if (errorMsg) {
        setFormError(errorMsg);
        return;
      }

      setFormError("");
      setNewFiles((prev) => [...prev, ...validFiles]);
      e.target.value = "";
    },
    [existingImages.length, newFiles.length],
  );

  const removeExistingImage = useCallback((index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeNewFile = useCallback((index) => {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

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

    const { title, description, price, location, category, condition } =
      formData;
    if (
      !title ||
      !description ||
      !price ||
      !location ||
      !category ||
      !condition
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

      await onSubmit({
        ...formData,
        price: Number(formData.price),
        year: formData.year ? Number(formData.year) : undefined,
        images: [...existingImages, ...uploadedUrls],
      });
    } catch (err) {
      console.error(err);
      setFormError("Failed to upload images or save listing.");
    } finally {
      setIsUploading(false);
    }
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <form onSubmit={handleSubmit} className="create-listing__form">
      {formError && <div className="create-listing__error">{formError}</div>}

      <div className="create-listing__image-section">
        <label>Bike Photos * (Max {MAX_IMAGES})</label>
        <div className="image-gallery">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="gallery-item">
              <img src={url} alt={`Existing ${index + 1}`} />
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => removeExistingImage(index)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}

          {newFiles.map((item, index) => (
            <div key={`new-${index}`} className="gallery-item">
              <img src={item.previewUrl} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => removeNewFile(index)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}

          {totalImages < MAX_IMAGES && (
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

        <div className="location-input-group">
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
          >
            {isLocating ? "Locating…" : "📍 Use My Location"}
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

      {previewCoords && (
        <div className="seller-preview-map">
          <p className="seller-map-hint">
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
          ? "Uploading…"
          : isLoading
            ? "Saving…"
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
