import PropTypes from "prop-types";

/**
 * Reusable min/max number input pair for range filters (Price, Year, etc.).
 *
 * @param {string} title - Section label
 * @param {string} minKey - State key for minimum value (e.g. "minPrice")
 * @param {string} maxKey - State key for maximum value (e.g. "maxPrice")
 * @param {object} filters - Current filter state
 * @param {function} onChange - Called with (key, numericValue)
 * @param {string} [minPlaceholder]
 * @param {string} [maxPlaceholder]
 * @param {string} [minLabel]
 * @param {string} [maxLabel]
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
  <div className="filter-section">
    <label className="filter-title">{title}</label>
    <div className="range-group">
      <div className="range-input-wrapper">
        <span className="range-label">{minLabel}</span>
        <input
          type="number"
          className="styled-input"
          placeholder={minPlaceholder}
          value={filters[minKey] || ""}
          onChange={(e) => onChange(minKey, Number(e.target.value))}
        />
      </div>
      <div className="range-input-wrapper">
        <span className="range-label">{maxLabel}</span>
        <input
          type="number"
          className="styled-input"
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
