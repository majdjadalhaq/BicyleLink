import { useState, useEffect, useCallback } from "react";
import { uploadToCloudinary } from "../../../utils/cloudinary";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const TOTAL_STEPS = 3;

export const useListingForm = ({ initialValues, onSubmit, isEditMode }) => {
  const [step, setStep] = useState(1);

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

  const validateStep = useCallback(() => {
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
  }, [formData, step, isEditMode, existingImages.length, newFiles.length]);

  const handleNext = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (validateStep()) {
        setStep((prev) => prev + 1);
      }
    },
    [validateStep],
  );

  const jumpToStep = useCallback(
    (e, targetStep) => {
      if (e) e.preventDefault();
      if (targetStep < step || validateStep()) {
        setStep(targetStep);
      }
    },
    [step, validateStep],
  );

  const handlePrev = useCallback((e) => {
    if (e) e.preventDefault();
    setFormError("");
    setStep((prev) => prev - 1);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (step < TOTAL_STEPS) {
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
        newFiles.map((item) => uploadToCloudinary(item.file)),
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

  return {
    step,
    totalSteps: TOTAL_STEPS,
    formData,
    existingImages,
    newFiles,
    isUploading,
    isLocating,
    formError,
    expandedSections,
    previewCoords,
    totalImages,
    MAX_IMAGES,
    toggleSection,
    handleChange,
    handleUseMyLocation,
    handleMapLocationChange,
    handleFileChange,
    removeExistingImage,
    removeNewFile,
    handleNext,
    handlePrev,
    jumpToStep,
    handleSubmit,
  };
};
