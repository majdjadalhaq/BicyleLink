import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import styles from "./VerifyCode.module.css"; // Reusing styles

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSuccess = () => {
    navigate("/reset-password", { state: { email } });
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/request-reset",
    onSuccess,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reset your password</h1>
      <p
        style={{ textAlign: "center", marginBottom: "24px", color: "#4b5563" }}
      >
        Enter your email address and we&apos;ll send you a code to reset your
        password.
      </p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
        />
        <SubmitButton isLoading={isLoading}>Send Reset Code</SubmitButton>
      </form>
      {error && <div className={styles.error}>{error.toString()}</div>}

      <div className={styles.loginLink}>
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
        >
          Back to Login
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
