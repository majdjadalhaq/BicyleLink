import { useState, useCallback } from "react";

/**
 * Custom hook to encapsulate navigator.geolocation logic.
 * Returns the user's position, distance to a target, loading state, and error.
 */
const useGeolocation = (targetLat, targetLng) => {
  const [position, setPosition] = useState(null); // [lat, lng]
  const [distance, setDistance] = useState(null); // km string
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const dist = calculateDistance(
          latitude,
          longitude,
          targetLat,
          targetLng,
        );
        setPosition([latitude, longitude]);
        setDistance(dist.toFixed(1));
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setError(
          "Unable to fetch your location. Please check your permissions.",
        );
        setIsLocating(false);
      },
      { timeout: 10000 },
    );
  }, [targetLat, targetLng, calculateDistance]);

  return { position, distance, isLocating, error, locate };
};

export default useGeolocation;
