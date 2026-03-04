import PropTypes from "prop-types";

/**
 * Reusable chip-toggle group for multi-select filters.
 * Renders a row of clickable chips, each toggling in the active selection.
 */
const FilterChips = ({ title, options, selected, onToggle }) => (
  <div className="flex flex-col gap-3">
    <label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">
      {title}
    </label>
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const value = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const isActive = selected?.includes(value);
        return (
          <div
            key={value}
            className={`px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] cursor-pointer text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 transition-all font-bold select-none hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 ${
              isActive
                ? "!bg-emerald-600 dark:!bg-emerald-500 !text-white !border-emerald-600 dark:!border-emerald-500 shadow-md shadow-emerald-600/20"
                : ""
            }`}
            onClick={() => onToggle(value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onToggle(value)}
            aria-pressed={isActive}
          >
            {label}
          </div>
        );
      })}
    </div>
  </div>
);

FilterChips.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ label: PropTypes.string, value: PropTypes.string }),
    ]),
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
  onToggle: PropTypes.func.isRequired,
};

export default FilterChips;
