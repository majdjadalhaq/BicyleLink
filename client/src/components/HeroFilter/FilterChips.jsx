import PropTypes from "prop-types";

/**
 * Reusable chip-toggle group for multi-select filters.
 * Renders a row of clickable chips, each toggling in the active selection.
 *
 * @param {string} title - Section label
 * @param {Array} options - Array of { label, value } or plain string options
 * @param {string[]} selected - Currently selected values
 * @param {function} onToggle - Called with the toggled value
 */
const FilterChips = ({ title, options, selected, onToggle }) => (
  <div className="filter-section">
    <label className="filter-title">{title}</label>
    <div className="filter-chips">
      {options.map((opt) => {
        const value = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <div
            key={value}
            className={`filter-chip ${selected?.includes(value) ? "active" : ""}`}
            onClick={() => onToggle(value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onToggle(value)}
            aria-pressed={selected?.includes(value)}
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
