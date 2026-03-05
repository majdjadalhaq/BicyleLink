import { useState } from "react";
import { useNavigate } from "react-router";
import { uploadToCloudinary } from "../../utils/cloudinary";
import ImageCropper from "../../components/ImageCropper/ImageCropper";

import SelectField from "../../components/form/SelectField";
import TextAreaField from "../../components/form/TextAreaField";
import SubmitButton from "../../components/form/SubmitButton";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useCountryStateCity } from "../../hooks/useCountryStateCity";

const ProfileSetup = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { Country, City, isLoaded: cscLoaded } = useCountryStateCity();

  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [validationError, setValidationError] = useState("");

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Cropper State
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onSuccess = (data) => {
    if (data?.user) {
      login(data.user);
    }
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

  const uploadImageToCloudinary = async (file) => {
    return uploadToCloudinary(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    let avatarUrl = user?.avatarUrl;

    if (avatarFile) {
      setIsUploadingImage(true);
      try {
        avatarUrl = await uploadImageToCloudinary(avatarFile);
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

  const cityOptions = cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

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

        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
            Welcome to BiCycleL
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
            Let&apos;s finish setting up your profile so you can start trading.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-500/10 transition-all group-hover:ring-emerald-500/30">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <path
                        d="M12 11v4M10 13h4"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer text-white font-bold text-xs"
              >
                Change Photo
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Profile Picture
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between mt-4 -mb-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                Location
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={!cscLoaded}
                className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Detect
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                  Country
                </label>
                <SelectField
                  name="country"
                  value={selectedCountryCode}
                  onChange={handleCountryChange}
                  options={countryOptions}
                  placeholder="Select..."
                  disabled={!cscLoaded}
                />
              </div>
              <div className="flex flex-col gap-1.5 focus-within:opacity-100 transition-opacity">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                  City
                </label>
                <SelectField
                  name="city"
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                  placeholder="Select..."
                  disabled={!cscLoaded || !selectedCountryCode}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                About You
              </label>
              <TextAreaField
                name="bio"
                value={bio}
                onChange={setBio}
                placeholder="Share your passion for cycling..."
                rows={4}
              />
            </div>
          </div>

          {validationError && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {validationError}
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={isLoading || isUploadingImage}
            >
              Skip
            </button>
            <div className="flex-1 w-full">
              <SubmitButton
                isLoading={isLoading || isUploadingImage}
                className="w-full py-3.5 font-black uppercase tracking-widest text-sm"
              >
                Complete Setup
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
