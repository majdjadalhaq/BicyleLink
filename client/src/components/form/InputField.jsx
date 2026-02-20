import styles from "./InputField.module.css";
import PropTypes from "prop-types";

const InputField = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  dataTestId,
  ...rest
}) => (
  <div className={styles.inputGroup}>
    {label && <label htmlFor={name}>{label}</label>}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      data-testid={dataTestId}
      {...rest}
    />
  </div>
);

InputField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  dataTestId: PropTypes.string,
};

InputField.defaultProps = {
  label: undefined,
  type: "text",
  value: "",
  placeholder: "",
  dataTestId: undefined,
};

export default InputField;
