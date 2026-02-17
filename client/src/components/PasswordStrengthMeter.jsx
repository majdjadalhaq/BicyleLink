import styles from "../pages/User/CreateUser.module.css";

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (password) => {
    let strength = 0;
    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getStrengthText = (strength) => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthColor = (strength) => {
    if (strength <= 2) return "#ef4444"; // Red
    if (strength <= 3) return "#f59e0b"; // Orange
    if (strength <= 4) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  const getStrengthWidth = (strength) => {
    return `${(strength / 5) * 100}%`;
  };

  if (!password) return null;

  return (
    <div className={styles.strengthMeter}>
      <div className={styles.strengthBarContainer}>
        <div
          className={styles.strengthBar}
          style={{
            width: getStrengthWidth(strength),
            backgroundColor: getStrengthColor(strength),
          }}
        />
      </div>
      <span
        className={styles.strengthText}
        style={{ color: getStrengthColor(strength) }}
      >
        Password Strength: {getStrengthText(strength)}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
