import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "./components/GoogleLoginButton";
import LoginVisualSection from "./components/LoginVisualSection";
import LoginForm from "./components/LoginForm";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const GOOGLE_CLIENT_ID =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
  (typeof process !== "undefined" && process.env?.VITE_GOOGLE_CLIENT_ID) ||
  "placeholder-client-id.apps.googleusercontent.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      body: { email, password, rememberMe: false },
    });

    if (data?.success) {
      onSuccess(data);
    } else if (data?.necessitatesVerification) {
      navigate("/verify-code", { state: { email: data.email } });
    }
  };

  const displayError = validationError || (error ? error.toString() : "");

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#F1F4F2] dark:bg-[#0a0a0a] overflow-hidden">
        <LoginVisualSection />

        {/* Right: Authentication Interface */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
          <div className="w-full max-md relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-500"
                onClick={() => navigate("/")}
              >
                <img
                  src="/favicon.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain drop-shadow-glow"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter leading-none">
                  Login
                </h1>
              </div>
            </div>

            {/* Google Integration */}
            <div className="mb-8">
              <GoogleLoginButton
                clientId={GOOGLE_CLIENT_ID}
                onSuccess={onSuccess}
                onError={setValidationError}
              />
            </div>

            {/* Terminal Divider */}
            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                Login with Email
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            </div>

            <LoginForm
              handleSubmit={handleSubmit}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isLoading={isLoading}
              displayError={displayError}
            />

            <footer className="mt-12 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                New here?{" "}
                <Link
                  to="/signup"
                  className="text-emerald-700 dark:text-emerald-400 font-black hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors uppercase tracking-widest ml-1"
                >
                  Create Account
                </Link>
              </p>
            </footer>
          </div>

          <div className="absolute top-0 right-0 p-8 flex flex-col items-end opacity-20 pointer-events-none">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              Welcome Back
            </span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
