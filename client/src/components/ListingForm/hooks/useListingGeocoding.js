import { useCallback, useEffect, useRef } from "react";
import { apiClient } from "../../../services/apiClient";

export const useListingGeocoding = (
  formData,
  setFormData,
  setFormError,
  setIsLocating,
  setRecenterTrigger,
) => {
  const skipGeocodeRef = useRef(false);

  // Debounced geocoding — fires 1.5s after user stops typing a location
  useEffect(() => {
    if (!formData.location || formData.location.length <= 2) return;

    const timer = setTimeout(async () => {
      if (skipGeocodeRef.current) {
        skipGeocodeRef.current = false;
        return;
      }

      try {
        const data = await apiClient.get(
          `/utils/geocode?q=${encodeURIComponent(formData.location)}`,
        );
        if (data.success) {
          setFormData((prev) => ({ ...prev, coordinates: data.result }));
          setRecenterTrigger((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Geocoding preview failed", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.location, setFormData, setRecenterTrigger]);

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
          const data = await apiClient.get(
            `/utils/reverse-geocode?lat=${latitude}&lon=${longitude}`,
          );
          if (data.success) {
            skipGeocodeRef.current = true;
            setFormData((prev) => ({
              ...prev,
              location: data.result,
              coordinates: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            }));
            setRecenterTrigger((prev) => prev + 1);
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
  }, [setFormData, setFormError, setIsLocating, setRecenterTrigger]);

  const reverseGeocodeDebounceRef = useRef(null);

  const handleMapLocationChange = useCallback(
    async (newCoords) => {
      const [lng, lat] = newCoords;
      setFormData((prev) => ({
        ...prev,
        coordinates: { type: "Point", coordinates: newCoords },
      }));

      // Cancel pending reverse geocode
      if (reverseGeocodeDebounceRef.current) {
        clearTimeout(reverseGeocodeDebounceRef.current);
      }

      // Debounce reverse geocoding for map drag
      reverseGeocodeDebounceRef.current = setTimeout(async () => {
        try {
          const data = await apiClient.get(
            `/utils/reverse-geocode?lat=${lat}&lon=${lng}`,
          );
          if (data.success) {
            skipGeocodeRef.current = true;
            setFormData((prev) => ({ ...prev, location: data.result }));
          }
        } catch (err) {
          console.error("Reverse geocoding after drag failed:", err);
        }
      }, 800);
    },
    [setFormData],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reverseGeocodeDebounceRef.current) {
        clearTimeout(reverseGeocodeDebounceRef.current);
      }
    };
  }, []);

  return {
    handleUseMyLocation,
    handleMapLocationChange,
  };
};
