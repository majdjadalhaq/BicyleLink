import { useState } from "react";
import { useNavigate } from "react-router";
import { uploadToCloudinary } from "../../utils/cloudinary";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useCountryStateCity } from "../../hooks/useCountryStateCity";
import ProfileSetupHeader from "./components/ProfileSetupHeader";
import ProfileSetupForm from "./components/ProfileSetupForm";

const ProfileSetup = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { Country, City, isLoaded: cscLoaded } = useCountryStateCity();

  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [validationError, setValidationError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onSuccess = (data) => {
    if (data?.user) login(data.user);
    navigate("/");
  };

  const { isLoading, performFetch } = useFetch("/users/profile", onSuccess);

  const countries = cscLoaded && Country ? Country.getAllCountries() : [];
  const cities =
    cscLoaded && City && selectedCountryCode
      ? City.getCitiesOfCountry(selectedCountryCode)
      : [];

  const handleCountryChange = (value) => {
    const countryObj = countries.find((c) => c.isoCode === value);
    setSelectedCountryCode(value);
    setCountry(countryObj ? countryObj.name : "");
    setCity("");
  };

  const handleDetectLocation = () => {
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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], "avatar.jpg", {
      type: "image/jpeg",
    });
    setAvatarFile(croppedFile);
    setAvatarPreview(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    let avatarUrl = user?.avatarUrl;

    if (avatarFile) {
      setIsUploadingImage(true);
      try {
        avatarUrl = await uploadToCloudinary(avatarFile);
      } catch (err) {
        console.error(err);
        setIsUploadingImage(false);
        setValidationError("Failed to upload image. Please try again.");
        return;
      }
      setIsUploadingImage(false);
    }

    performFetch({
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ country, city, bio, avatarUrl }),
    });
  };

  const countryOptions = countries.map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));
  const cityOptions = cities.map((c) => ({ value: c.name, label: c.name }));

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-xl w-full">
        {showCropper && (
          <ImageCropper
            image={tempImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}

        <ProfileSetupHeader />

        <ProfileSetupForm
          handleSubmit={handleSubmit}
          avatarPreview={avatarPreview}
          handleFileChange={handleFileChange}
          handleDetectLocation={handleDetectLocation}
          cscLoaded={cscLoaded}
          selectedCountryCode={selectedCountryCode}
          handleCountryChange={handleCountryChange}
          countryOptions={countryOptions}
          city={city}
          setCity={setCity}
          cityOptions={cityOptions}
          bio={bio}
          setBio={setBio}
          validationError={validationError}
          isLoading={isLoading}
          isUploadingImage={isUploadingImage}
          onSkip={() => navigate("/")}
        />
      </div>
    </div>
  );
};

export default ProfileSetup;
