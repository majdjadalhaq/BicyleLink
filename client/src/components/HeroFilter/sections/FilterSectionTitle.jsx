import PropTypes from "prop-types";

const FilterSectionTitle = ({
  title,
  name,
  expandedSections,
  toggleSection,
  groupClassName = "",
}) => (
  <button
    type="button"
    onClick={() => toggleSection(name)}
    className={`flex items-center justify-between w-full group ${groupClassName}`}
  >
    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors">
      {title}
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
      className={`text-gray-400 transition-transform duration-300 ${expandedSections[name] ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
);

FilterSectionTitle.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  expandedSections: PropTypes.object.isRequired,
  toggleSection: PropTypes.func.isRequired,
  groupClassName: PropTypes.string,
};

export default FilterSectionTitle;
