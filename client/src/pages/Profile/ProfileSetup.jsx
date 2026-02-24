import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Country, City } from "country-state-city";

import { FaUserCircle } from "react-icons/fa";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../utils/config";
import ImageCropper from "../../components/ImageCropper/ImageCropper";

import SelectField from "../../components/form/SelectField";
import TextAreaField from "../../components/form/TextAreaField";
import SubmitButton from "../../components/form/SubmitButton";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";

const ProfileSetup = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

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
      login(data.user); // Update global auth state
    }
    navigate("/"); // Send to Home after setup
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/profile",
    onSuccess,
  );

  const countries = Country.getAllCountries();
  const cities = selectedCountryCode
    ? City.getCitiesOfCountry(selectedCountryCode)
    : [];

  const handleCountryChange = (value) => {
    const countryObj = countries.find((c) => c.isoCode === value);
    setSelectedCountryCode(value);
    setCountry(countryObj ? countryObj.name : "");
    setCity("");
  };

  const validateForm = () => {
    setValidationError("");
    return true;
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
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(url, { method: "POST", body: data });
    if (!response.ok) throw new Error("Failed to upload image");
    const json = await response.json();
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let avatarUrl = user?.avatarUrl;

    if (avatarFile) {
      setIsUploadingImage(true);
      try {
        avatarUrl = await uploadImageToCloudinary(avatarFile);
      } catch {
        setIsUploadingImage(false);
        setValidationError("Failed to upload image to Cloudinary.");
        return;
      }
      setIsUploadingImage(false);
    }

    performFetch({
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        country,
        city,
        bio,
        avatarUrl,
      }),
    });
  };

  const handleSkip = () => {
    navigate("/");
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
    <div className="max-w-[500px] mx-auto py-10 px-6 sm:px-8 animate-in slide-in-from-bottom-2 duration-300">
      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Complete Your Profile
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-base">
        Help others know you better by filling out these details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 p-6 sm:p-8 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-surface shadow-md"
      >
        {/* Avatar Upload Section */}
        <div className="flex justify-center mb-6">
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer rounded-full overflow-hidden w-32 h-32 flex items-center justify-center bg-gray-50 dark:bg-dark-input border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <FaUserCircle size={80} color="#cbd5e1" />
                <span>Upload Photo</span>
              </div>
            )}
          </label>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <SelectField
          name="country"
          value={selectedCountryCode}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder="Select Country"
        />
        <SelectField
          name="city"
          value={city}
          onChange={setCity}
          options={cityOptions}
          placeholder="Select City"
          disabled={!selectedCountryCode}
        />
        <TextAreaField
          name="bio"
          value={bio}
          onChange={setBio}
          placeholder="Tell us a little about yourself (optional)"
          rows={4}
        />

        {validationError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center">
            {validationError}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center">
            {error.toString()}
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <button
            type="button"
            onClick={handleSkip}
            className="bg-transparent border-none text-gray-500 font-medium cursor-pointer py-2 px-4 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-dark-input hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isUploadingImage}
          >
            Skip for Now
          </button>
          <SubmitButton isLoading={isLoading || isUploadingImage}>
            Save Profile
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;
