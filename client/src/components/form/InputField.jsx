import PropTypes from "prop-types";

const InputField = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  dataTestId,
  className,
  ...rest
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && (
      <label htmlFor={name} className="text-sm font-medium ml-1">
        {label}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      data-testid={dataTestId}
      className={`input-emerald ${className || ""}`}
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
  className: PropTypes.string,
};

InputField.defaultProps = {
  label: undefined,
  type: "text",
  value: "",
  placeholder: "",
  dataTestId: undefined,
  className: "",
};

export default InputField;
