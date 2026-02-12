import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import { useAuth } from "../../hooks/useAuth";
import styles from "./VerifyCode.module.css";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onResendSuccess = () => {
    setTimer(60);
    // Optional: Add toast here
  };

  const {
    isLoading: isResending,
    error: resendError,
    performFetch: performResend,
  } = useFetch("/users/resend-code", onResendSuccess);

  const handleResend = () => {
    performResend({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });
  };

  const { login } = useAuth();

  const onSuccess = (data) => {
    // Update global auth state with user data
    if (data?.user) {
      login(data.user);
    }
    navigate("/");
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/verify",
    onSuccess,
  );

  useEffect(() => {
    if (!email) {
      // If no email in state, redirect to signup or login
      // For now, redirect to login as they might have signed up but navigated away
      navigate("/login");
    }
    // Removing cancelFetch from here as it triggers abort on re-render due to useFetch implementation
  }, [email, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      // Basic client validation
      // We can add a state for validation error if needed, but skipping for MVP
    }
    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Check your email</h1>
      <p
        style={{ textAlign: "center", marginBottom: "24px", color: "#4b5563" }}
      >
        We sent a verification code to <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <InputField
          name="code"
          value={code}
          onChange={setCode}
          placeholder="Enter 6-digit code"
          // dataTestId="verify-code-input"
        />
        <SubmitButton isLoading={isLoading}>Verify Email</SubmitButton>
      </form>
      {error && <div className={styles.error}>{error.toString()}</div>}

      <div className={styles.loginLink}>
        <button
          onClick={handleResend}
          disabled={timer > 0 || isResending}
          type="button"
          style={{
            background: "none",
            border: "none",
            color: timer > 0 || isResending ? "#9ca3af" : "#4f46e5",
            cursor: timer > 0 || isResending ? "not-allowed" : "pointer",
            textDecoration: timer > 0 || isResending ? "none" : "underline",
            fontSize: "14px",
            fontWeight: 500,
            padding: 0,
          }}
        >
          {isResending
            ? "Sending..."
            : timer > 0
              ? `Resend code in ${timer}s`
              : "Resend Code"}
        </button>
        {resendError && (
          <div style={{ color: "#991b1b", marginTop: "8px", fontSize: "14px" }}>
            {resendError.toString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCode;
