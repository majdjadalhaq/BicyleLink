import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "placeholder-client-id.apps.googleusercontent.com";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { execute: executeGoogleLogin, isLoading } = useApi();
  const isClientIdPlaceholder =
    GOOGLE_CLIENT_ID === "placeholder-client-id.apps.googleusercontent.com";

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const result = await executeGoogleLogin("/users/google", {
        method: "POST",
        body: { token: tokenResponse.access_token },
      });
      if (result.success) {
        onSuccess(result.user);
      }
    } catch (err) {
      onError(err.message || "Google login failed.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError("Google login was canceled or failed."),
  });

  return (
    <div className="w-full">
      {isClientIdPlaceholder && (
        <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-500 text-center">
          Google Login is not configured. Please add VITE_GOOGLE_CLIENT_ID to
          your .env file.
        </div>
      )}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2.5 mb-4 border border-light-border dark:border-dark-border rounded-lg text-white hover:bg-white/5 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => login()}
        disabled={isLoading || isClientIdPlaceholder}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="w-5 h-5 bg-white rounded-full p-0.5"
        />
        {isLoading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || "/";

  const onSuccess = (data) => {
    const userToLogin = data.user || data;
    login(userToLogin);
    setEmail("");
    setPassword("");
    setValidationError("");
    navigate(from, { replace: true });
  };

  const { execute: executeLogin, isLoading, error } = useApi();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = await executeLogin("/users/login", {
      method: "POST",
      body: {
        email,
        password,
        rememberMe: false, // Removed from UI to match exact mock
      },
    });

    if (data?.success) {
      onSuccess(data);
    }
  };

  let statusComponents = null;
  if (validationError) {
    statusComponents = (
      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5"
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
      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
        {error.toString()}
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Full screen wrapper that enforces exact dark mode */}
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)] bg-light-bg dark:bg-dark-bg">
        {/* Main Edge-to-Edge Container */}
        <div className="w-full h-full min-h-[calc(100vh-64px)] flex flex-row overflow-hidden bg-light-surface dark:bg-dark-surface">
          {/* Left Side: Landscape Image */}
          <div className="hidden md:block md:w-1/2 relative">
            <img
              // Unsplash beautiful mountain road
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
              alt="Mountain road"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full md:w-1/2 p-10 sm:p-16 lg:px-24 flex flex-col justify-center relative bg-light-surface dark:bg-dark-surface">
            <h1 className="text-3xl font-bold text-white mb-10 text-center tracking-tight">
              Welcome Back
            </h1>

            <GoogleLoginButton
              onSuccess={onSuccess}
              onError={setValidationError}
            />

            {/* Apple Button UI Dummy */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 mb-10 border border-light-border dark:border-dark-border rounded-lg text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              Continue with Apple
            </button>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="flex flex-col gap-1.5 focus-within:text-emerald-500 text-gray-400">
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
                  className="w-full bg-light-input dark:bg-dark-input border border-emerald-500/40 focus:border-emerald-500 rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500"
                  autoComplete="username"
                />
              </div>

              <div className="flex flex-col gap-1.5 focus-within:text-emerald-500 text-gray-400">
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
                  className="w-full bg-light-input dark:bg-dark-input border border-emerald-500/40 focus:border-emerald-500 rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500"
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors text-base"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </div>
            </form>

            {statusComponents}

            <p className="mt-8 text-center text-sm text-gray-300">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
