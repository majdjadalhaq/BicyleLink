import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleSignupButton from "./components/GoogleSignupButton";
import SignupVisualSection from "./components/SignupVisualSection";
import SignupForm from "./components/SignupForm";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { getEnv } from "../../utils/config";
import TEST_ID from "./CreateUser.testid";

const GOOGLE_CLIENT_ID =
  getEnv("VITE_GOOGLE_CLIENT_ID") ||
  "placeholder-client-id.apps.googleusercontent.com";

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        },
      },
    });

    if (data?.success) {
      handleSuccess(data.user, false);
    }
  };

  const displayError = validationError || (error ? error.toString() : "");

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        data-testid={TEST_ID.container}
        className="flex w-full min-h-[calc(100vh-64px)] bg-[#F1F4F2] dark:bg-[#0a0a0a] overflow-hidden"
      >
        <SignupVisualSection />

        {/* Right: Registration Interface */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 relative">
          <div className="w-full max-w-lg relative z-10">
            <div className="flex items-center gap-4 mb-6">
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
                  Create Account
                </h1>
              </div>
            </div>

            {/* Google Signup Integration */}
            <div className="mb-8">
              <GoogleSignupButton
                onSuccess={handleSuccess}
                onError={setValidationError}
              />
            </div>

            {/* Terminal Divider */}
            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                Sign up with Email
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            </div>

            <SignupForm
              handleSubmit={handleSubmit}
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              isLoading={isLoading}
              displayError={displayError}
              TEST_ID={TEST_ID}
            />

            <footer className="mt-10 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-700 dark:text-emerald-400 font-black hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors uppercase tracking-widest ml-1"
                >
                  Login
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CreateUser;
