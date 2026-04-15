import PropTypes from "prop-types";
import DualRangeSlider from "../../ui/DualRangeSlider";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../../../utils/constants";

const FilterContentArea = ({
  expandedSections,
  localFilters,
  handleChipToggle,
  handleRangeChange,
  currentYear,
}) => {
  return (
    <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl overflow-hidden min-h-0 border border-gray-100/50 dark:border-white/5">
      {/* Categories - Compacted */}
      {expandedSections.category && (
        <div className="p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2.5 pl-0.5">
            Category
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleChipToggle("category", cat.value)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border truncate text-center ${
                  localFilters.category?.includes(cat.value)
                    ? "bg-emerald-800 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-600 text-white shadow-glow"
                    : "bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-500/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Condition - Compacted */}
      {expandedSections.condition && (
        <div className="p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2.5 pl-0.5">
            Condition
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CONDITION_OPTIONS.map((cond) => (
              <button
                key={cond.value}
                onClick={() => handleChipToggle("condition", cond.value)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border truncate text-center ${
                  localFilters.condition?.includes(cond.value)
                    ? "bg-emerald-800 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-600 text-white shadow-glow"
                    : "bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-400/30"
                }`}
              >
                {cond.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      {expandedSections.price && (
        <div className="p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <DualRangeSlider
            label="Price Range"
            min={0}
            max={10000}
            step={50}
            value={[
              localFilters.minPrice || 0,
              localFilters.maxPrice || 10000,
            ]}
            onChange={([min, max]) => {
              handleRangeChange("minPrice", min);
              handleRangeChange("maxPrice", max);
            }}
            formatValue={(v) => `€${v.toLocaleString()}`}
          />
        </div>
      )}

      {/* Year Range Slider */}
      {expandedSections.year && (
        <div className="p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <DualRangeSlider
            label="Model Year"
            min={1990}
            max={currentYear}
            step={1}
            value={[
              localFilters.minYear || 1990,
              localFilters.maxYear || currentYear,
            ]}
            onChange={([min, max]) => {
              handleRangeChange("minYear", min);
              handleRangeChange("maxYear", max);
            }}
          />
        </div>
      )}
    </div>
  );
};

FilterContentArea.propTypes = {
  expandedSections: PropTypes.object.isRequired,
  localFilters: PropTypes.object.isRequired,
  handleChipToggle: PropTypes.func.isRequired,
  handleRangeChange: PropTypes.func.isRequired,
  currentYear: PropTypes.number.isRequired,
};

export default FilterContentArea;
