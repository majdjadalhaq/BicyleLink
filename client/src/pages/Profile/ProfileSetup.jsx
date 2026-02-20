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
import styles from "./ProfileSetup.module.css";

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
    <div className={styles.container}>
      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <h1 className={styles.title}>Complete Your Profile</h1>
      <p className={styles.subtitle}>
        Help others know you better by filling out these details.
      </p>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Avatar Upload Section */}
        <div className={styles.avatarSection}>
          <label htmlFor="avatar-upload" className={styles.avatarLabel}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className={styles.avatarPreview}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
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
            className={styles.fileInput}
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
          <div className={styles.validationError}>{validationError}</div>
        )}
        {error && <div className={styles.error}>{error.toString()}</div>}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleSkip}
            className={styles.skipButton}
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
