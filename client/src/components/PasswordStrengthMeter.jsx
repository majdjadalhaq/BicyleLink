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

  const strengthColors = {
    bar: [
      "bg-gray-300 dark:bg-dark-border",
      "bg-red-500",
      "bg-red-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-emerald-500",
    ],
    text: [
      "text-gray-400",
      "text-red-500",
      "text-red-500",
      "text-amber-500",
      "text-yellow-500",
      "text-emerald-500",
    ],
  };

  const getStrengthWidth = (strength) => {
    return `${(strength / 5) * 100}%`;
  };

  if (!password) return null;

  return (
    <div className="-mt-1 mb-4">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${strengthColors.bar[strength]}`}
          style={{ width: getStrengthWidth(strength) }}
        />
      </div>
      <span className={`text-xs font-medium ${strengthColors.text[strength]}`}>
        Password Strength: {getStrengthText(strength)}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
