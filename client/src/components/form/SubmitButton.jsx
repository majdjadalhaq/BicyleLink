import styles from "./SubmitButton.module.css";

const SubmitButton = ({
  isLoading = false,
  disabled = false,
  children,
  dataTestId,
}) => (
  <button
    type="submit"
    disabled={disabled || isLoading}
    data-testid={dataTestId}
    className={styles.submitBtn}
  >
    {isLoading ? "Signing up..." : children}
  </button>
);

export default SubmitButton;
