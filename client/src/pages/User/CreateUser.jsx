import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Country, City } from "country-state-city";

import InputField from "../../components/form/InputField";
import SelectField from "../../components/form/SelectField";
import TextAreaField from "../../components/form/TextAreaField";
import SubmitButton from "../../components/form/SubmitButton";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import useFetch from "../../hooks/useFetch";
import TEST_ID from "./CreateUser.testid";
import styles from "./CreateUser.module.css";

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();

  const onSuccess = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setBio("");
    setCountry("");
    setCity("");
    setSelectedCountryCode("");
    setAgreedToTerms(false);
    setValidationError("");
    navigate("/verify-code", { state: { email } });
  };

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/users",
    onSuccess,
  );

  useEffect(() => {
    return cancelFetch;
  }, []);

  const countries = Country.getAllCountries();
  const cities = selectedCountryCode
    ? City.getCitiesOfCountry(selectedCountryCode)
    : [];

  const handleCountryChange = (value) => {
    const countryObj = countries.find((c) => c.isoCode === value);
    setSelectedCountryCode(value);
    setCountry(countryObj ? countryObj.name : "");
    setCity("");
  };

  const validateForm = () => {
    if (!username.trim()) {
      setValidationError("Username is required");
      return false;
    }

    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }

    if (!password) {
      setValidationError("Password is required");
      return false;
    }

    if (!confirmPassword) {
      setValidationError("Please confirm your password");
      return false;
    }

    if (!country) {
      setValidationError("Country is required");
      return false;
    }

    if (!city) {
      setValidationError("City is required");
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setValidationError("Username must be 3-30 alphanumeric characters");
      return false;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setValidationError(
        "Password must have min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol",
      );
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    if (agreedToTerms !== true) {
      setValidationError("You must accept the Terms of Service");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        user: {
          name: username,
          email,
          password,
          bio: bio || undefined,
          city: city || undefined,
          country: country || undefined,
          agreedToTerms,
        },
      }),
    });
  };

  const countryOptions = countries.map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const cityOptions = cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  let statusComponent = null;
  if (validationError) {
    statusComponent = (
      <div
        data-testid={TEST_ID.validationErrorContainer}
        className={styles.validationError}
      >
        {validationError}
      </div>
    );
  } else if (error != null) {
    statusComponent = (
      <div data-testid={TEST_ID.errorContainer} className={styles.error}>
        Error while trying to create user: {error.toString()}
      </div>
    );
  } else if (isLoading) {
    statusComponent = (
      <div data-testid={TEST_ID.loadingContainer} className={styles.loading}>
        Creating user...
      </div>
    );
  }

  return (
    <div data-testid={TEST_ID.container} className={styles.container}>
      <h1 className={styles.title}>Sign Up</h1>
      <form onSubmit={handleSubmit} noValidate className={styles.formContainer}>
        <InputField
          name="username"
          value={username}
          onChange={setUsername}
          placeholder="Username (3-30 alphanumeric)"
          dataTestId={TEST_ID.usernameInput}
          autoComplete="username"
        />
        <InputField
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
          dataTestId={TEST_ID.emailInput}
          autoComplete="email"
        />
        <InputField
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password (min 8 chars, mixed case, number, symbol)"
          dataTestId={TEST_ID.passwordInput}
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={password} />
        <InputField
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm Password"
          dataTestId={TEST_ID.confirmPasswordInput}
          autoComplete="new-password"
        />
        <SelectField
          name="country"
          value={selectedCountryCode}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder="Country"
          dataTestId={TEST_ID.countrySelect}
        />
        <SelectField
          name="city"
          value={city}
          onChange={setCity}
          options={cityOptions}
          placeholder="City"
          disabled={!selectedCountryCode}
          dataTestId={TEST_ID.citySelect}
        />
        <TextAreaField
          name="bio"
          value={bio}
          onChange={setBio}
          placeholder="Bio (optional)"
          rows={3}
          dataTestId={TEST_ID.bioTextarea}
        />
        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            data-testid={TEST_ID.agreedToTermsInput}
          />
          <span className={styles.checkboxText}>
            I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>
          </span>
        </label>
        <SubmitButton isLoading={isLoading} dataTestId={TEST_ID.submitButton}>
          Sign Up
        </SubmitButton>
      </form>
      {statusComponent}
      <p className={styles.loginLink}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default CreateUser;
