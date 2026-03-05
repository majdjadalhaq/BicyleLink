import PropTypes from "prop-types";
import InputField from "../../form/InputField";
import SelectField from "../../form/SelectField";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../../../utils/constants";

const StepBasicInfo = ({
  formData,
  handleChange,
  expandedSections,
  toggleSection,
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            Basic Information
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            The core details of your listing
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <InputField
          name="title"
          placeholder="Listing Title *"
          value={formData.title}
          onChange={(val) => handleChange("title", val)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        {/* Collapsible Category */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full group px-1"
          >
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
              Category *
            </label>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-gray-400 transition-transform duration-300 ${expandedSections.category ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {expandedSections.category && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <SelectField
                name="category"
                placeholder="Select Category"
                value={formData.category}
                onChange={(val) => handleChange("category", val)}
                options={CATEGORY_OPTIONS}
              />
            </div>
          )}
        </div>

        {/* Collapsible Condition */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => toggleSection("condition")}
            className="flex items-center justify-between w-full group px-1"
          >
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
              Condition *
            </label>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-gray-400 transition-transform duration-300 ${expandedSections.condition ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {expandedSections.condition && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <SelectField
                name="condition"
                placeholder="Select Condition"
                value={formData.condition}
                onChange={(val) => handleChange("condition", val)}
                options={CONDITION_OPTIONS}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 col-span-full mt-4">
          <div className="flex justify-between items-center px-1">
            <label
              htmlFor="model-year-slider"
              className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Model Year
            </label>
          </div>
          <div className="flex items-center gap-4 px-1 group">
            <span className="text-[10px] font-bold text-gray-400 w-8 text-center pt-2">
              1990
            </span>

            <div className="flex-1 relative h-6 flex items-center">
              <label htmlFor="model-year-slider" className="sr-only">
                Model Year Slider
              </label>

              {/* Track Background */}
              <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                {/* Active Track Fill */}
                <div
                  className="absolute h-full bg-emerald-500/50 dark:bg-emerald-500/30"
                  style={{
                    left: `0%`,
                    width: `${((Number(formData.year || new Date().getFullYear()) - 1990) / (new Date().getFullYear() - 1990)) * 100}%`,
                  }}
                />
              </div>

              {/* Visual Handle with Tooltip */}
              <div
                className="absolute w-5 h-5 bg-white dark:bg-gray-100 rounded-full border-2 border-emerald-500 shadow-md shadow-emerald-500/20 transform -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center transition-transform active:scale-90 group-hover:scale-110"
                style={{
                  left: `${((Number(formData.year || new Date().getFullYear()) - 1990) / (new Date().getFullYear() - 1990)) * 100}%`,
                }}
              >
                {/* Floating tooltip */}
                <div className="absolute -top-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded-md shadow-lg text-[10px] font-black min-w-[36px] text-center">
                  {formData.year || new Date().getFullYear()}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-t-gray-900 dark:border-t-white border-t-[4px] border-l-transparent border-l-[4px] border-r-transparent border-r-[4px]" />
                </div>
              </div>

              {/* Real hidden input */}
              <input
                id="model-year-slider"
                name="model-year-slider"
                type="range"
                min="1990"
                max={new Date().getFullYear()}
                step="1"
                value={formData.year || new Date().getFullYear()}
                onChange={(e) => handleChange("year", e.target.value)}
                className="absolute w-full h-1.5 opacity-0 pointer-events-auto cursor-pointer z-20"
                style={{
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
            </div>

            <span className="text-[10px] font-bold text-gray-400 w-8 text-center pt-2">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

StepBasicInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  expandedSections: PropTypes.object.isRequired,
  toggleSection: PropTypes.func.isRequired,
};

export default StepBasicInfo;
