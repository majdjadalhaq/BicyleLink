import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import styles from "./VerifyCode.module.css";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const onSuccess = () => {
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
    </div>
  );
};

export default VerifyCode;
