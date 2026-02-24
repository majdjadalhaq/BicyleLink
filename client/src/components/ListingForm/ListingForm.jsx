import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import LocationMap from "../LocationMap";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../utils/config";

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

  const [step, setStep] = useState(1);
  const totalSteps = 3;

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

  // Derive preview coords from formData
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

  // Clean up object URLs
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

  const validateStep = () => {
    setFormError("");
    if (step === 1) {
      if (!formData.title || !formData.category || !formData.condition) {
        setFormError("Title, Category, and Condition are required.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.description || !formData.price || !formData.location) {
        setFormError("Description, Price, and Location are required.");
        return false;
      }
    } else if (step === 3 && !isEditMode) {
      if (existingImages.length === 0 && newFiles.length === 0) {
        setFormError("Please upload at least one image.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setFormError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-7 w-full">
      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between mb-4 relative z-0">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-dark-border -z-10 translate-y-[-50%] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald transition-all duration-300 ease-in-out progress-bar"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-4 border-white dark:border-dark-surface
              ${step >= num ? "bg-emerald text-white" : "bg-gray-200 dark:bg-dark-input text-gray-500"}`}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
        <span className={step >= 1 ? "text-emerald" : ""}>Basics</span>
        <span className={step >= 2 ? "text-emerald" : ""}>Details</span>
        <span className={step >= 3 ? "text-emerald" : ""}>Photos</span>
      </div>

      {formError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 font-medium">
          {formError}
        </div>
      )}

      {/* STEP 1: Basics */}
      {step === 1 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Basic Information
          </h2>
          <div className="flex flex-col gap-2">
            <InputField
              name="title"
              placeholder="Listing Title *"
              value={formData.title}
              onChange={(val) => handleChange("title", val)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              name="category"
              placeholder="Category *"
              value={formData.category}
              onChange={(val) => handleChange("category", val)}
              options={CATEGORY_OPTIONS}
            />
            <SelectField
              name="condition"
              placeholder="Condition *"
              value={formData.condition}
              onChange={(val) => handleChange("condition", val)}
              options={CONDITION_OPTIONS}
            />
            <InputField
              name="brand"
              placeholder="Brand (Optional)"
              value={formData.brand}
              onChange={(val) => handleChange("brand", val)}
            />
            <InputField
              name="model"
              placeholder="Model (Optional)"
              value={formData.model}
              onChange={(val) => handleChange("model", val)}
            />
            <InputField
              name="year"
              type="number"
              placeholder="Year (Optional)"
              value={formData.year}
              onChange={(val) => handleChange("year", val)}
            />
          </div>
        </div>
      )}

      {/* STEP 2: Details */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Details & Location
          </h2>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="font-bold text-gray-900 dark:text-white"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your bike (condition, upgrades, history)..."
              rows={6}
              className="w-full p-4 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 transition-all resize-y"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 dark:text-white">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                €
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                min="0"
                required
                className="w-full p-4 pl-10 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 dark:text-white">
              Location *
            </label>
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1">
                <InputField
                  name="location"
                  placeholder="City, Neighborhood, or Zip Code"
                  value={formData.location}
                  onChange={(val) => handleChange("location", val)}
                  required
                />
              </div>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 dark:bg-dark-input dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 whitespace-nowrap px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
                onClick={handleUseMyLocation}
                disabled={isLocating}
              >
                {isLocating ? "Locating…" : "📍 Use My Location"}
              </button>
            </div>
          </div>

          {previewCoords && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
              <p className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 px-4 py-3 text-sm font-medium m-0 flex items-center gap-2">
                <span>📍</span> Map Preview (Drag the pin to adjust precisely)
              </p>
              <LocationMap
                coordinates={previewCoords}
                draggable={true}
                onLocationChange={handleMapLocationChange}
                title="Set Listing Location"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Photos */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Photos
          </h2>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-900 dark:text-white">
              Bike Photos * (Max {MAX_IMAGES})
            </label>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              High-quality photos increase your chances of selling. Show the
              bike from different angles and any wear/damage.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-gray-100 dark:border-dark-border group group-hover:border-emerald-200"
                >
                  <img
                    src={url}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-red-600 hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => removeExistingImage(index)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {newFiles.map((item, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-emerald focus-within:ring-2 group"
                >
                  <img
                    src={item.previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-red-600 hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
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
                  className="aspect-square bg-gray-50 hover:bg-emerald-50 dark:bg-dark-input dark:hover:bg-dark-border border-2 border-dashed border-gray-300 hover:border-emerald dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-emerald transition-all gap-2 group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-4xl leading-none group-hover:scale-110 transition-transform">
                    +
                  </span>
                  <span className="font-semibold text-sm">Add Photo</span>
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
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="px-6 py-3 font-bold text-emerald border-2 border-emerald rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald/10 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div></div> // Empty placeholder to keep flex spacing valid
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-emerald hover:bg-emerald-hover text-white rounded-xl font-bold transition-all hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="submit"
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-indigo-500/30"
            disabled={isLoading || isUploading}
          >
            {isUploading
              ? "Uploading…"
              : isLoading
                ? "Saving…"
                : isEditMode
                  ? "Update Listing"
                  : "Publish Listing ✨"}
          </button>
        )}
      </div>
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
