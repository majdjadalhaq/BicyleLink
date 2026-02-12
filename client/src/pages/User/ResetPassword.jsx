import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import styles from "./VerifyCode.module.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const onSuccess = () => {
    navigate("/login");
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/reset-password",
    onSuccess,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!code || !newPassword || !confirmPassword) {
      setValidationError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
        newPassword,
      }),
    });
  };

  if (!email) {
    // Redirect if accessed directly without email state
    // setTimeout(() => navigate("/forgot-password"), 0);
    // Better: Show input for email too?
    // For MVP, assume flow. If broken, redirect.
    return (
      <div className={styles.container}>
        <p className={styles.error}>
          Invalid access. Please request a reset link first.
        </p>
        <div className={styles.loginLink}>
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
          >
            Go to Forgot Password
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Set new password</h1>
      <p
        style={{ textAlign: "center", marginBottom: "24px", color: "#4b5563" }}
      >
        Enter the code sent to <strong>{email}</strong> and your new password.
      </p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <InputField
          label="Verification Code"
          name="code"
          value={code}
          onChange={setCode}
          placeholder="6-digit code"
        />
        <InputField
          label="New Password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Min 8 chars"
        />
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter password"
        />

        {validationError && (
          <div className={styles.validationError}>{validationError}</div>
        )}

        <SubmitButton isLoading={isLoading}>Reset Password</SubmitButton>
      </form>
      {error && <div className={styles.error}>{error.toString()}</div>}
    </div>
  );
};

export default ResetPassword;
