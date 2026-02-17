import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import { useAuth } from "../../hooks/useAuth";
import styles from "./CreateUser.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSuccess = (data) => {
    login(data.user);
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
        rememberMe,
      }),
    });
  };

  let statusComponents = null;
  if (validationError) {
    statusComponents = (
      <div className={styles.validationError}>{validationError}</div>
    );
  } else if (error != null) {
    statusComponents = <div className={styles.error}>{error.toString()}</div>;
  } else if (isLoading) {
    statusComponents = <div className={styles.loading}>Logging in...</div>;
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
          autoComplete="username"
        />
        <InputField
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
          autoComplete="current-password"
        />

        <div className={styles.rememberMeContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
          <Link to="/forgot-password" className={styles.forgotPasswordLink}>
            Forgot Password?
          </Link>
        </div>

        <SubmitButton isLoading={isLoading}>Login</SubmitButton>
      </form>
      {statusComponents}
      <p className={styles.loginLink}>
        Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
