import PropTypes from "prop-types";
import ToggleSwitch from "../../../components/ui/ToggleSwitch";

const ToggleRow = ({ label, description, id, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
    <div className="flex-1 pr-4">
      <label
        htmlFor={id}
        className="text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
      >
        {label}
      </label>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        {description}
      </p>
    </div>
    <ToggleSwitch
      id={id}
      name={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);

ToggleRow.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ToggleRow;
