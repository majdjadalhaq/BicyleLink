import styles from "./SelectField.module.css";

const SelectField = ({
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder,
  dataTestId,
}) => (
  <div className={styles.selectGroup}>
    <label htmlFor={name}>{placeholder}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <option value="">Select {placeholder}</option>
      {options.map((opt, index) => (
        <option key={`${opt.value || opt}-${index}`} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
