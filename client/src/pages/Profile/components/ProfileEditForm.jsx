import PropTypes from "prop-types";
import SelectField from "../../../components/form/SelectField";
import TextAreaField from "../../../components/form/TextAreaField";
import SubmitButton from "../../../components/form/SubmitButton";

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-6 first:mt-0">
    {children}
  </p>
);

SectionLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

const FieldGroup = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {children}
  </div>
);

FieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const ProfileEditForm = ({
  name,
  setName,
  bio,
  setBio,
  handleDetectLocation,
  cscLoaded,
  selectedCountryCode,
  handleCountryChange,
  countryOptions,
  city,
  setCity,
  cityOptions,
  successMessage,
  validationError,
  error,
  isLoading,
  isUploadingImage,
}) => {
  return (
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
  );
};

ProfileEditForm.propTypes = {
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  bio: PropTypes.string,
  setBio: PropTypes.func.isRequired,
  handleDetectLocation: PropTypes.func.isRequired,
  cscLoaded: PropTypes.bool,
  selectedCountryCode: PropTypes.string,
  handleCountryChange: PropTypes.func.isRequired,
  countryOptions: PropTypes.array.isRequired,
  city: PropTypes.string,
  setCity: PropTypes.func.isRequired,
  cityOptions: PropTypes.array.isRequired,
  successMessage: PropTypes.string,
  validationError: PropTypes.string,
  error: PropTypes.any,
  isLoading: PropTypes.bool,
  isUploadingImage: PropTypes.bool,
};

export default ProfileEditForm;
