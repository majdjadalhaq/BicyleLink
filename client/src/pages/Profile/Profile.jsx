import { useState, useEffect, useRef } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import SelectField from "../../components/form/SelectField";
import TextAreaField from "../../components/form/TextAreaField";
import SubmitButton from "../../components/form/SubmitButton";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useCountryStateCity } from "../../hooks/useCountryStateCity";

/* ─── Star Rating Display ──────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i <= filled ? "#f59e0b" : "none"}
          stroke={i <= filled ? "#f59e0b" : "#6b7280"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

/* ─── Stat Pill ──────────────────────────────────────────────────── */
const StatPill = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 min-w-[80px]">
    <div className="text-emerald-500">{icon}</div>
    <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
      {value}
    </span>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
      {label}
    </span>
  </div>
);

/* ─── Section Label ──────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-6 first:mt-0">
    {children}
  </p>
);

/* ─── Field Wrapper ──────────────────────────────────────────────── */
const FieldGroup = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {children}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
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
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, saving, synced
  const saveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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

    saveTimerRef.current = setTimeout(() => {
      syncProfile();
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [name, country, city, bio]);

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
    if (!validateForm()) return;

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

  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-10 px-6 text-center text-gray-900 dark:text-white border border-gray-100 dark:border-white/5 rounded-2xl mt-12 bg-white dark:bg-[#1a1a1a]">
        Please login first
      </div>
    );
  }

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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium flex items-center gap-2">
            Keep your information up to date
            {syncStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-emerald-500 ml-2 animate-pulse font-bold text-[10px] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Saving...
              </span>
            )}
            {syncStatus === "synced" && (
              <span className="flex items-center gap-1.5 text-emerald-500 ml-2 font-bold text-[10px] uppercase tracking-widest">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Changes Synced
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── LEFT SIDEBAR (sticky on desktop) ── */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24 flex flex-col gap-5">
                {/* Avatar Card — with gradient cover banner */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                  {/* Gradient Banner */}
                  <div className="h-20 bg-gradient-to-br from-[#10B77F]/30 via-[#0EA572]/15 to-[#10221C]/20 dark:from-[#10B77F]/20 dark:via-[#10221C]/30 dark:to-[#121212] relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,183,127,0.15),transparent_70%)]" />
                  </div>
                  <div className="px-6 pb-6 flex flex-col items-center gap-4 -mt-12">
                    {/* Avatar with hover overlay */}
                    <div className="relative">
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer block relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 dark:border-white/10 shadow-xl group/avatar"
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                            <svg
                              className="w-14 h-14 text-emerald-500/60"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                          </div>
                        )}
                        {/* Camera overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                        </div>
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Name & email */}
                    <div className="text-center">
                      <h2 className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[180px]">
                        {user.name}
                      </h2>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px] mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Stat pills */}
                    <div className="flex gap-2 flex-wrap justify-center">
                      <StatPill
                        value={user?.listingCount ?? 0}
                        label="Listings"
                        icon={
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="2"
                              y="3"
                              width="20"
                              height="14"
                              rx="2"
                              ry="2"
                            />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                        }
                      />
                      <StatPill
                        value={
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{Number(user?.rating ?? 0).toFixed(1)}</span>
                            <StarRating rating={user?.rating ?? 0} />
                          </div>
                        }
                        label="Rating"
                        icon={
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        }
                      />
                    </div>

                    {/* Join date */}
                    {joinedDate && (
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Joined {joinedDate}
                      </p>
                    )}

                    {/* Bio preview (read-only) */}
                    {bio && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center italic leading-relaxed line-clamp-3 border-t border-gray-100 dark:border-white/5 pt-4 w-full">
                        &ldquo;{bio}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Save button — visible on desktop in sidebar */}
                <div className="hidden lg:block">
                  <SubmitButton
                    isLoading={isLoading || isUploadingImage}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm uppercase tracking-widest"
                  >
                    Save Changes
                  </SubmitButton>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN (form) ── */}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6 sm:p-8">
                <SectionLabel>Personal Details</SectionLabel>

                <div className="flex flex-col gap-5">
                  <FieldGroup label="Username">
                    <input
                      type="text"
                      className="px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-[#111] transition-all focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Choose a unique username"
                    />
                  </FieldGroup>

                  <FieldGroup label="Bio">
                    <TextAreaField
                      name="bio"
                      value={bio}
                      onChange={setBio}
                      placeholder="Tell us a little about yourself"
                      rows={3}
                    />
                  </FieldGroup>

                  <div className="flex items-center justify-between mt-4 mb-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Location
                    </p>
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

                  <SelectField
                    name="country"
                    value={selectedCountryCode}
                    onChange={handleCountryChange}
                    options={countryOptions}
                    placeholder="Select Country"
                    disabled={!cscLoaded}
                  />
                  <SelectField
                    name="city"
                    value={city}
                    onChange={setCity}
                    options={cityOptions}
                    placeholder="Select City"
                    disabled={!cscLoaded || !selectedCountryCode}
                  />
                </div>

                {/* Messages */}
                {successMessage && (
                  <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm text-center font-bold flex items-center justify-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {successMessage}
                  </div>
                )}
                {validationError && (
                  <div className="mt-5 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center font-medium">
                    {validationError}
                  </div>
                )}
                {error && (
                  <div className="mt-5 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-700 dark:text-red-400 text-sm text-center">
                    {error.toString()}
                  </div>
                )}
              </div>

              {/* Save button — mobile only (below form) */}
              <div className="lg:hidden mt-4">
                <SubmitButton
                  isLoading={isLoading || isUploadingImage}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm uppercase tracking-widest"
                >
                  Save Changes
                </SubmitButton>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
