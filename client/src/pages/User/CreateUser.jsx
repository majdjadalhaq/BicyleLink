import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import TEST_ID from "./CreateUser.testid";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "placeholder-client-id.apps.googleusercontent.com";

const GoogleSignupButton = ({ onSuccess, onError }) => {
  const { execute: executeGoogleSignup, isLoading } = useApi();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const result = await executeGoogleSignup("/users/google", {
        method: "POST",
        body: { token: tokenResponse.access_token },
      });
      if (result.success) {
        onSuccess(result.user, true);
      }
    } catch (err) {
      onError(err.message || "Google signup failed.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError("Google signup was canceled or failed."),
  });

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 py-2.5 mb-4 border border-[#333333] rounded-lg text-white hover:bg-white/5 transition-colors text-sm font-medium"
      onClick={() => login()}
      disabled={isLoading}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        className="w-5 h-5 bg-white p-0.5 rounded-full"
      />
      {isLoading ? "Signing up..." : "Continue with Google"}
    </button>
  );
};

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (userToLogin, isGoogle = false) => {
    setValidationError("");
    if (isGoogle) {
      login(userToLogin);
      navigate("/", { replace: true });
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreedToTerms(false);
      navigate("/verify-code", { state: { email } });
    }
  };

  const { execute: executeSignup, isLoading, error } = useApi();

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

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = await executeSignup("/users", {
      method: "POST",
      body: {
        user: {
          name: username,
          email,
          password,
          agreedToTerms,
        },
      },
    });

    if (data?.success) {
      handleSuccess(data.user, false);
    }
  };

  let statusComponents = null;
  if (validationError) {
    statusComponents = (
      <div
        data-testid={TEST_ID.validationErrorContainer}
        className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {validationError}
      </div>
    );
  } else if (error != null) {
    statusComponents = (
      <div
        data-testid={TEST_ID.errorContainer}
        className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error.toString()}
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        data-testid={TEST_ID.container}
        className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)] py-10 px-4 bg-[#1a1a1a]"
      >
        {/* Main Card Container */}
        <div className="w-full max-w-[1000px] h-auto min-h-[640px] flex flex-row rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)] bg-[#222222]">
          {/* Left Side: Landscape Image */}
          <div className="hidden md:block md:w-1/2 relative">
            <img
              // Bicycle-themed image
              src="https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=2070&auto=format&fit=crop"
              alt="Bicycle leaning against wall"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Right Side: Signup Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-14 flex flex-col justify-center relative bg-[#222222]">
            <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
              Create an Account
            </h1>

            <GoogleSignupButton
              onSuccess={handleSuccess}
              onError={setValidationError}
            />

            {/* Apple Button UI Dummy */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 mb-6 border border-[#333333] rounded-lg text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              Continue with Apple
            </button>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="flex flex-col gap-1.5 focus-within:text-[#10B981] text-gray-400">
                <label
                  htmlFor="username"
                  className="text-sm font-medium ml-1 transition-colors"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username (3-30 alphanumeric)"
                  data-testid={TEST_ID.usernameInput}
                  className="w-full bg-[#1e1e1e] border border-[#10B981]/40 focus:border-[#10B981] rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-[#10B981]"
                  autoComplete="username"
                />
              </div>

              <div className="flex flex-col gap-1.5 focus-within:text-[#10B981] text-gray-400">
                <label
                  htmlFor="email"
                  className="text-sm font-medium ml-1 transition-colors"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  data-testid={TEST_ID.emailInput}
                  className="w-full bg-[#1e1e1e] border border-[#10B981]/40 focus:border-[#10B981] rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-[#10B981]"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-1.5 focus-within:text-[#10B981] text-gray-400">
                <label
                  htmlFor="password"
                  className="text-sm font-medium ml-1 transition-colors"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  data-testid={TEST_ID.passwordInput}
                  className="w-full bg-[#1e1e1e] border border-[#10B981]/40 focus:border-[#10B981] rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-[#10B981]"
                  autoComplete="new-password"
                />
              </div>

              <div className="-mt-1 mb-2">
                <PasswordStrengthMeter password={password} />
              </div>

              <div className="flex flex-col gap-1.5 focus-within:text-[#10B981] text-gray-400">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium ml-1 transition-colors"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  data-testid={TEST_ID.confirmPasswordInput}
                  className="w-full bg-[#1e1e1e] border border-[#10B981]/40 focus:border-[#10B981] rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-[#10B981]"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-start gap-3 mt-4 mb-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  data-testid={TEST_ID.agreedToTermsInput}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald focus:ring-emerald dark:border-gray-600 dark:bg-[#1e1e1e] dark:focus:ring-offset-[#222222] cursor-pointer"
                />
                <span className="text-sm text-gray-400 leading-snug">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-[#10B981] hover:text-[#34D399] transition-colors font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-[#10B981] hover:text-[#34D399] transition-colors font-medium"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  data-testid={TEST_ID.submitButton}
                  className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-bold transition-colors text-base"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </button>
              </div>
            </form>

            {statusComponents}

            <p className="mt-8 text-center text-sm text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#10B981] hover:text-[#34D399] transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CreateUser;
