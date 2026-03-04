import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { getEnv } from "../../utils/config";
import TEST_ID from "./CreateUser.testid";

const GOOGLE_CLIENT_ID =
  getEnv("VITE_GOOGLE_CLIENT_ID") ||
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
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#10221C]/50 border border-gray-200 dark:border-[#10B77F]/20 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#10B77F]/10 hover:border-[#10B77F]/40 transition-all text-sm font-bold shadow-sm hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed group"
      onClick={() => login()}
      disabled={isLoading}
    >
      <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm group-hover:scale-110 transition-transform">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="w-full h-full"
        />
      </div>
      {isLoading ? "Signing up..." : "Continue with Google"}
    </button>
  );
};

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
        {/* Left: Interactive Visual Section */}
        <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-center p-16 overflow-hidden">
          {/* Background Image with sophisticated mask */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop"
              alt="Community Riding"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-black/60 to-black z-10" />
            <div className="absolute inset-0 backdrop-blur-[2px] z-20" />
          </div>

          <div className="relative z-30 space-y-8 max-w-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Join the Community
              </span>
            </div>

            <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
              Start Your <br />
              <span className="text-[#10B77F] drop-shadow-[0_0_15px_rgba(16,183,127,0.4)]">
                Journey.
              </span>
            </h2>

            <p className="text-lg text-gray-300 font-medium leading-relaxed">
              Join thousands of cyclists. Access curated listings and connect
              with the community in our premium network.
            </p>

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={`https://i.pravatar.cc/100?u=sign${i}`}
                        alt="user"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-2">
                  Vanguard Riders
                </p>
              </div>
              <p className="text-xs font-bold text-white tracking-tight leading-relaxed">
                &ldquo;The most sophisticated trade platform I&apos;ve used. The
                community here is unmatched.&rdquo;
              </p>
            </div>
          </div>
        </div>

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

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="username"
                  className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  data-testid={TEST_ID.usernameInput}
                  className="w-full px-6 py-3.5 bg-gray-50/50 dark:bg-[#10221C]/30 border border-gray-100 dark:border-[#10B77F]/10 rounded-2xl text-sm focus:border-[#10B77F] focus:ring-4 focus:ring-[#10B77F]/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  data-testid={TEST_ID.emailInput}
                  className="w-full px-6 py-3.5 bg-gray-50/50 dark:bg-[#10221C]/30 border border-gray-100 dark:border-[#10B77F]/10 rounded-2xl text-sm focus:border-[#10B77F] focus:ring-4 focus:ring-[#10B77F]/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
                >
                  Password
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    data-testid={TEST_ID.passwordInput}
                    className="w-full pl-12 pr-6 py-3.5 bg-gray-50/50 dark:bg-[#10221C]/30 border border-gray-100 dark:border-[#10B77F]/10 rounded-2xl text-sm focus:border-[#10B77F] focus:ring-4 focus:ring-[#10B77F]/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors z-10"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    data-testid={TEST_ID.confirmPasswordInput}
                    className="w-full pl-12 pr-6 py-3.5 bg-gray-50/50 dark:bg-[#10221C]/30 border border-gray-100 dark:border-[#10B77F]/10 rounded-2xl text-sm focus:border-[#10B77F] focus:ring-4 focus:ring-[#10B77F]/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <PasswordStrengthMeter password={password} />
              </div>

              {displayError && (
                <div className="md:col-span-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-500 flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                data-testid={TEST_ID.submitButton}
                className="md:col-span-2 py-4 bg-[#10B77F] hover:bg-[#0EA572] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-glow hover:shadow-glow-strong disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

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
