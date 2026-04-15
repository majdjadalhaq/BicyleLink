import { useState, useEffect, useRef } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import ProfileEditSidebar from "./components/ProfileEditSidebar";
import ProfileEditForm from "./components/ProfileEditForm";
import ProfileUpdateStatus from "./components/ProfileUpdateStatus";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useCountryStateCity } from "../../hooks/useCountryStateCity";
import { useProfileLocation } from "./hooks/useProfileLocation";

const Profile = () => {
  const { user, login } = useAuth();
  const { Country, City, isLoaded: cscLoaded } = useCountryStateCity();

  const [name, setName] = useState(user?.name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [syncStatus, setSyncStatus] = useState("idle");
  const saveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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

  const { handleDetectLocation } = useProfileLocation(
    countries,
    handleCountryChange,
    setCity,
    setValidationError,
  );

  const onSuccess = (data) => {
    if (data?.user) login(data.user);
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/profile",
    (data) => {
      onSuccess(data);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
  );

  const validateForm = () => {
    if (!name) {
      setValidationError("Username is required");
      return false;
    }
    setValidationError("");
    return true;
  };

  const syncProfile = async () => {
    if (!validateForm()) return;
    setSyncStatus("saving");
    performFetch({
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        country,
        city,
        bio,
        avatarUrl: user?.avatarUrl,
      }),
    });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => syncProfile(), 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [name, country, city, bio]);

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
    if (!validateForm()) return;
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
      body: JSON.stringify({ name, country, city, bio, avatarUrl }),
    });
  };

  const countryOptions = countries.map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));
  const cityOptions = cities.map((c) => ({ value: c.name, label: c.name }));

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  if (!user)
    return (
      <div className="max-w-lg mx-auto py-10 px-6 text-center text-gray-900 dark:text-white border border-gray-100 dark:border-white/5 rounded-2xl mt-12 bg-white dark:bg-[#1a1a1a]">
        Please login first
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300">
      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium flex items-center gap-2">
            Keep your information up to date
            <ProfileUpdateStatus syncStatus={syncStatus} />
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            <ProfileEditSidebar
              user={user}
              avatarPreview={avatarPreview}
              handleFileChange={handleFileChange}
              joinedDate={joinedDate}
              bio={bio}
              isLoading={isLoading}
              isUploadingImage={isUploadingImage}
            />
            <ProfileEditForm
              name={name}
              setName={setName}
              bio={bio}
              setBio={setBio}
              handleDetectLocation={handleDetectLocation}
              cscLoaded={cscLoaded}
              selectedCountryCode={selectedCountryCode}
              handleCountryChange={handleCountryChange}
              countryOptions={countryOptions}
              city={city}
              setCity={setCity}
              cityOptions={cityOptions}
              successMessage={successMessage}
              validationError={validationError}
              error={error}
              isLoading={isLoading}
              isUploadingImage={isUploadingImage}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
