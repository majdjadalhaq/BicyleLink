import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
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
  });

  // Keep track of existing images (URLs) vs new files to upload
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // Array of { file, previewUrl }
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        price: initialValues.price ? String(initialValues.price) : "",
        year: initialValues.year ? String(initialValues.year) : "",
        category: initialValues.category || "Other", // Default for legacy data
        condition: initialValues.condition || "good", // Default for legacy data
      }));
      if (initialValues.images && Array.isArray(initialValues.images)) {
        setExistingImages(initialValues.images);
      }
    }
  }, [initialValues]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newFiles]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    // Reset input so change event fires again if same file selected
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
      // 1. Upload new files
      const uploadedUrls = await Promise.all(
        newFiles.map((item) => uploadImageToCloudinary(item.file)),
      );

      // 2. Combine with existing images
      const finalImages = [...existingImages, ...uploadedUrls];

      // 3. Prepare payload
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
          {/* Existing Images */}
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

          {/* New File Previews */}
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
          className="form-textarea" // Ensure you have/add styles for this or reuse styles
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

        <InputField
          name="location"
          placeholder="Location *"
          value={formData.location}
          onChange={(val) => handleChange("location", val)}
          required
        />

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
