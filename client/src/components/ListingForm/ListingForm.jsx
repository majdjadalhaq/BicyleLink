import { useRef } from "react";
import PropTypes from "prop-types";
import { useListingForm } from "./hooks/useListingForm";
import StepBasicInfo from "./steps/StepBasicInfo";
import StepDetails from "./steps/StepDetails";
import StepImages from "./steps/StepImages";
const ListingForm = ({
  initialValues,
  onSubmit,
  isLoading,
  isEditMode = false,
}) => {
  const fileInputRef = useRef(null);

  const {
    step,
    totalSteps,
    formData,
    existingImages,
    newFiles,
    isUploading,
    isLocating,
    formError,
    expandedSections,
    previewCoords,
    totalImages,
    MAX_IMAGES,
    toggleSection,
    handleChange,
    handleUseMyLocation,
    handleMapLocationChange,
    handleFileChange,
    removeExistingImage,
    removeNewFile,
    handleNext,
    handlePrev,
    jumpToStep,
    handleSubmit,
  } = useListingForm({ initialValues, onSubmit, isEditMode });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-7 w-full"
    >
      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between mb-4 relative z-0">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-dark-border -z-10 translate-y-[-50%] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-in-out progress-bar"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            type="button"
            onClick={(e) => jumpToStep(e, num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 border-white dark:border-dark-surface cursor-pointer hover:scale-110 active:scale-95
              ${step >= num ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-200 dark:bg-dark-input text-gray-500"}`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
        <span className={step >= 1 ? "text-emerald-500" : ""}>Basics</span>
        <span className={step >= 2 ? "text-emerald-500" : ""}>Details</span>
        <span className={step >= 3 ? "text-emerald-500" : ""}>Photos</span>
      </div>

      {formError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 font-medium">
          {formError}
        </div>
      )}

      {/* STEP 1: Basics */}
      {step === 1 && (
        <StepBasicInfo
          formData={formData}
          handleChange={handleChange}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
      )}

      {/* STEP 2: Details */}
      {step === 2 && (
        <StepDetails
          formData={formData}
          handleChange={handleChange}
          handleUseMyLocation={handleUseMyLocation}
          isLocating={isLocating}
          previewCoords={previewCoords}
          handleMapLocationChange={handleMapLocationChange}
        />
      )}

      {/* STEP 3: Photos */}
      {step === 3 && (
        <StepImages
          existingImages={existingImages}
          newFiles={newFiles}
          MAX_IMAGES={MAX_IMAGES}
          totalImages={totalImages}
          removeExistingImage={removeExistingImage}
          removeNewFile={removeNewFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="px-6 py-3 font-bold text-emerald border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald/10 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div></div> // Empty placeholder to keep flex spacing valid
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-lg transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-indigo-500/30"
            disabled={isLoading || isUploading}
          >
            {isUploading
              ? "Uploading…"
              : isLoading
                ? "Saving…"
                : isEditMode
                  ? "Update Listing"
                  : "Publish Listing"}
          </button>
        )}
      </div>
    </form>
  );
};

ListingForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEditMode: PropTypes.bool,
};

export default ListingForm;
