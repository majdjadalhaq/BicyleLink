import PropTypes from "prop-types";
import InputField from "../../form/InputField";
import LocationMap from "../../Map/LocationMap";

const StepDetails = ({
  formData,
  handleChange,
  handleUseMyLocation,
  isLocating,
  previewCoords,
  recenterTrigger,
  handleMapLocationChange,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            Details & Location
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Pricing, description, and mapping
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="description"
          className="font-bold text-gray-900 dark:text-white"
        >
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your bike (condition, upgrades, history)..."
          rows={6}
          className="w-full p-4 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-y"
          required
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <label
            htmlFor="listing-price"
            className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
          >
            Price (€) *
          </label>
          {formData.price && (
            <span className="text-[10px] font-bold text-emerald-500 font-mono">
              Current: €{Number(formData.price).toLocaleString()}
            </span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
            €
          </span>
          <input
            id="listing-price"
            name="listing-price"
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            min="0"
            required
            className="w-full p-4 pl-10 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>
        {/* Price Slider */}
        <div className="flex items-center gap-4 px-1">
          <span className="text-[10px] font-bold text-gray-400 w-8">0</span>
          <label htmlFor="price-slider" className="sr-only">
            Price Adjustment Slider
          </label>
          <input
            id="price-slider"
            name="price-slider"
            type="range"
            min="0"
            max="5000"
            step="50"
            value={formData.price || 0}
            onChange={(e) => handleChange("price", e.target.value)}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] font-bold text-gray-400 w-8">5k+</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="listing-location"
          className="font-bold text-gray-900 dark:text-white"
        >
          Location *
        </label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1">
            <InputField
              id="listing-location"
              name="location"
              placeholder="City, Neighborhood, or Zip Code"
              value={formData.location}
              onChange={(val) => handleChange("location", val)}
              required
            />
          </div>
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 dark:bg-dark-input dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 whitespace-nowrap px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            onClick={handleUseMyLocation}
            disabled={isLocating}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {isLocating ? "Locating…" : "Use My Location"}
          </button>
        </div>
      </div>

      {previewCoords && (
        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
          <p className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 px-4 py-3 text-sm font-medium m-0 flex items-center gap-2">
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Map Preview (Drag the pin to adjust precisely)
          </p>
          <LocationMap
            coordinates={previewCoords}
            draggable={true}
            onLocationChange={handleMapLocationChange}
            recenterTrigger={recenterTrigger}
            title="Set Listing Location"
          />
        </div>
      )}
    </div>
  );
};

StepDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleUseMyLocation: PropTypes.func.isRequired,
  isLocating: PropTypes.bool.isRequired,
  previewCoords: PropTypes.array,
  recenterTrigger: PropTypes.number,
  handleMapLocationChange: PropTypes.func.isRequired,
};

export default StepDetails;
