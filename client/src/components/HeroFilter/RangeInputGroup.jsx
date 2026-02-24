import PropTypes from "prop-types";

/**
 * Reusable min/max number input pair for range filters (Price, Year, etc.).
 */
const RangeInputGroup = ({
  title,
  minKey,
  maxKey,
  filters,
  onChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  minLabel = "Min",
  maxLabel = "Max",
}) => (
  <div className="flex flex-col gap-3">
    <label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">
      {title}
    </label>
    <div className="grid grid-cols-2 gap-4 items-end">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {minLabel}
        </span>
        <input
          type="number"
          className="w-full px-3 py-2.5 bg-white dark:bg-dark-input border border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-200 transition-colors focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 placeholder-gray-400"
          placeholder={minPlaceholder}
          value={filters[minKey] || ""}
          onChange={(e) => onChange(minKey, Number(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {maxLabel}
        </span>
        <input
          type="number"
          className="w-full px-3 py-2.5 bg-white dark:bg-dark-input border border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-200 transition-colors focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 placeholder-gray-400"
          placeholder={maxPlaceholder}
          value={filters[maxKey] || ""}
          onChange={(e) => onChange(maxKey, Number(e.target.value))}
        />
      </div>
    </div>
  </div>
);

RangeInputGroup.propTypes = {
  title: PropTypes.string.isRequired,
  minKey: PropTypes.string.isRequired,
  maxKey: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  minPlaceholder: PropTypes.string,
  maxPlaceholder: PropTypes.string,
  minLabel: PropTypes.string,
  maxLabel: PropTypes.string,
};

export default RangeInputGroup;
