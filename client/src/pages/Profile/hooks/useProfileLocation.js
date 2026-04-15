import { useCallback } from "react";

export const useProfileLocation = (
  countries,
  handleCountryChange,
  setCity,
  setValidationError,
) => {
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setValidationError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        );
        const data = await response.json();
        if (data.address) {
          const countryName = data.address.country;
          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.state;
          if (countryName) {
            const countryObj = countries.find(
              (c) =>
                c.name === countryName ||
                (countryName === "United Kingdom" && c.isoCode === "GB") ||
                (countryName === "United States" && c.isoCode === "US"),
            );
            if (countryObj) {
              handleCountryChange(countryObj.isoCode);
              if (cityName) setCity(cityName);
            }
          }
        }
      } catch (err) {
        console.error("Geolocation error:", err);
      }
    });
  }, [countries, handleCountryChange, setCity, setValidationError]);

  return { handleDetectLocation };
};
