import { useState } from "react";
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

const Profile = () => {
  const { user, login } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 5000);
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
    if (!name) {
      setValidationError("Username is required");
      return false;
    }
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
        name,
        country,
        city,
        bio,
        avatarUrl,
      }),
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

  if (!user)
    return (
      <div className="max-w-[500px] mx-auto py-10 px-6 sm:px-8 text-center text-gray-900 border border-gray-100 rounded-xl mt-12 bg-white">
        Please login first
      </div>
    );

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
        Edit Profile
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-base">
        Keep your information up to date.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 p-6 sm:p-8 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-surface shadow-md"
      >
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
                <span>Change Photo</span>
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

        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            className="px-3 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-dark-input transition-all focus:outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Choose a unique username"
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
          placeholder="Tell us a little about yourself"
          rows={4}
        />

        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm text-center font-medium">
            {successMessage}
          </div>
        )}
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

        <div className="flex justify-center items-center mt-3">
          <SubmitButton isLoading={isLoading || isUploadingImage}>
            Update Profile
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Profile;
