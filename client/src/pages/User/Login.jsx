import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import styles from "./CreateUser.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();

  const onSuccess = () => {
    // In PR #1, we'll just log success and redirect
    // In PR #1, we'll just log success and redirect
    // console.log("Login success:", data); // Removed for production
    setEmail("");
    setPassword("");
    setValidationError("");
    navigate("/");
  };

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/users/login",
    onSuccess,
  );

  useEffect(() => {
    return cancelFetch;
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!password) {
      setValidationError("Password is required");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  };

  let statusComponent = null;
  if (validationError) {
    statusComponent = (
      <div className={styles.validationError}>{validationError}</div>
    );
  } else if (error != null) {
    statusComponent = <div className={styles.error}>{error.toString()}</div>;
  } else if (isLoading) {
    statusComponent = <div className={styles.loading}>Logging in...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} noValidate className={styles.formContainer}>
        <InputField
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
        />
        <InputField
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
        />
        <div style={{ textAlign: "right", marginBottom: "12px" }}>
          <Link
            to="/forgot-password"
            style={{
              fontSize: "14px",
              color: "#4f46e5",
              textDecoration: "none",
            }}
          >
            Forgot Password?
          </Link>
        </div>
        <SubmitButton isLoading={isLoading}>Login</SubmitButton>
      </form>
      {statusComponent}
      <p className={styles.loginLink}>
        Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
