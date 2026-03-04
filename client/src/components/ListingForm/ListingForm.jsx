import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import LocationMap from "../LocationMap";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../utils/config";

import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../../utils/constants";

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
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    condition: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const jumpToStep = (e, targetStep) => {
    if (e) e.preventDefault();
    // Only allow jumping to steps if moving backward OR if the current step is valid
    if (targetStep < step || validateStep()) {
      setStep(targetStep);
    }
  };

  const handlePrev = (e) => {
    if (e) e.preventDefault();
    setFormError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Hard check: we MUST be on step 3 to actually perform the DB update
    if (step < totalSteps) {
      handleNext();
      return;
    }

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
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-7 w-full"
    >
      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between mb-4 relative z-0">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-dark-border -z-10 translate-y-[-50%] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-in-out progress-bar"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            type="button"
            onClick={(e) => jumpToStep(e, num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 border-white dark:border-dark-surface cursor-pointer hover:scale-110 active:scale-95
              ${step >= num ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-200 dark:bg-dark-input text-gray-500"}`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
        <span className={step >= 1 ? "text-emerald-500" : ""}>Basics</span>
        <span className={step >= 2 ? "text-emerald-500" : ""}>Details</span>
        <span className={step >= 3 ? "text-emerald-500" : ""}>Photos</span>
      </div>

      {formError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 font-medium">
          {formError}
        </div>
      )}

      {/* STEP 1: Basics */}
      {step === 1 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Basic Information
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                The core details of your listing
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <InputField
              name="title"
              placeholder="Listing Title *"
              value={formData.title}
              onChange={(val) => handleChange("title", val)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Collapsible Category */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => toggleSection("category")}
                className="flex items-center justify-between w-full group px-1"
              >
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
                  Category *
                </label>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-gray-400 transition-transform duration-300 ${expandedSections.category ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {expandedSections.category && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <SelectField
                    name="category"
                    placeholder="Select Category"
                    value={formData.category}
                    onChange={(val) => handleChange("category", val)}
                    options={CATEGORY_OPTIONS}
                  />
                </div>
              )}
            </div>

            {/* Collapsible Condition */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => toggleSection("condition")}
                className="flex items-center justify-between w-full group px-1"
              >
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
                  Condition *
                </label>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-gray-400 transition-transform duration-300 ${expandedSections.condition ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {expandedSections.condition && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <SelectField
                    name="condition"
                    placeholder="Select Condition"
                    value={formData.condition}
                    onChange={(val) => handleChange("condition", val)}
                    options={CONDITION_OPTIONS}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-8 col-span-full mt-4">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="model-year-slider"
                  className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                >
                  Model Year
                </label>
              </div>
              <div className="flex items-center gap-4 px-1 group">
                <span className="text-[10px] font-bold text-gray-400 w-8 text-center pt-2">
                  1990
                </span>

                <div className="flex-1 relative h-6 flex items-center">
                  <label htmlFor="model-year-slider" className="sr-only">
                    Model Year Slider
                  </label>

                  {/* Track Background */}
                  <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                    {/* Active Track Fill */}
                    <div
                      className="absolute h-full bg-emerald-500/50 dark:bg-emerald-500/30"
                      style={{
                        left: `0%`,
                        width: `${((Number(formData.year || new Date().getFullYear()) - 1990) / (new Date().getFullYear() - 1990)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Visual Handle with Tooltip */}
                  <div
                    className="absolute w-5 h-5 bg-white dark:bg-gray-100 rounded-full border-2 border-emerald-500 shadow-md shadow-emerald-500/20 transform -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center transition-transform active:scale-90 group-hover:scale-110"
                    style={{
                      left: `${((Number(formData.year || new Date().getFullYear()) - 1990) / (new Date().getFullYear() - 1990)) * 100}%`,
                    }}
                  >
                    {/* Floating tooltip */}
                    <div className="absolute -top-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded-md shadow-lg text-[10px] font-black min-w-[36px] text-center">
                      {formData.year || new Date().getFullYear()}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-t-gray-900 dark:border-t-white border-t-[4px] border-l-transparent border-l-[4px] border-r-transparent border-r-[4px]" />
                    </div>
                  </div>

                  {/* Real hidden input */}
                  <input
                    id="model-year-slider"
                    name="model-year-slider"
                    type="range"
                    min="1990"
                    max={new Date().getFullYear()}
                    step="1"
                    value={formData.year || new Date().getFullYear()}
                    onChange={(e) => handleChange("year", e.target.value)}
                    className="absolute w-full h-1.5 opacity-0 pointer-events-auto cursor-pointer z-20"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                  />
                </div>

                <span className="text-[10px] font-bold text-gray-400 w-8 text-center pt-2">
                  {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Details */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Details & Location
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Pricing, description, and mapping
              </p>
            </div>
          </div>
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
              className="w-full p-4 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-y"
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <label
                htmlFor="listing-price"
                className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                Price (€) *
              </label>
              {formData.price && (
                <span className="text-[10px] font-bold text-emerald-500 font-mono">
                  Current: €{Number(formData.price).toLocaleString()}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                €
              </span>
              <input
                id="listing-price"
                name="listing-price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                min="0"
                required
                className="w-full p-4 pl-10 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
              />
            </div>
            {/* Price Slider */}
            <div className="flex items-center gap-4 px-1">
              <span className="text-[10px] font-bold text-gray-400 w-8">0</span>
              <label htmlFor="price-slider" className="sr-only">
                Price Adjustment Slider
              </label>
              <input
                id="price-slider"
                name="price-slider"
                type="range"
                min="0"
                max="5000"
                step="50"
                value={formData.price || 0}
                onChange={(e) => handleChange("price", e.target.value)}
                className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] font-bold text-gray-400 w-8">
                5k+
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="listing-location"
              className="font-bold text-gray-900 dark:text-white"
            >
              Location *
            </label>
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1">
                <InputField
                  id="listing-location"
                  name="location"
                  placeholder="City, Neighborhood, or Zip Code"
                  value={formData.location}
                  onChange={(val) => handleChange("location", val)}
                  required
                />
              </div>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 dark:bg-dark-input dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 whitespace-nowrap px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                onClick={handleUseMyLocation}
                disabled={isLocating}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {isLocating ? "Locating…" : "Use My Location"}
              </button>
            </div>
          </div>

          {previewCoords && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
              <p className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 px-4 py-3 text-sm font-medium m-0 flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Map Preview (Drag the pin to adjust precisely)
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Upload Photos
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Show your bike to the world
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="bike-photos"
              className="font-bold text-gray-900 dark:text-white"
            >
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
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-red-600 hover:scale-105 active:scale-90 transition-all sm:opacity-0 sm:group-hover:opacity-100 opacity-100 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingImage(index);
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {newFiles.map((item, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-emerald-500 focus-within:ring-2 group"
                >
                  <img
                    src={item.previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-red-600 hover:scale-105 active:scale-90 transition-all sm:opacity-0 sm:group-hover:opacity-100 opacity-100 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNewFile(index);
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {totalImages < MAX_IMAGES && (
                <button
                  type="button"
                  className="aspect-square bg-gray-50 hover:bg-emerald-50 dark:bg-dark-input dark:hover:bg-dark-border border-2 border-dashed border-gray-300 hover:border-emerald-500 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-emerald-500 transition-all gap-2 group cursor-pointer"
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
              id="bike-photos"
              name="bike-photos"
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
            className="px-6 py-3 font-bold text-emerald border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald/10 transition-colors"
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
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-indigo-500/30"
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
