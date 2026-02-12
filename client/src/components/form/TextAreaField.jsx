import styles from "./TextAreaField.module.css";

const TextAreaField = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  dataTestId,
}) => (
  <div className={styles.textAreaGroup}>
    <label htmlFor={name}>{placeholder}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      data-testid={dataTestId}
    />
  </div>
);

export default TextAreaField;
