import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

const GOOGLE_CLIENT_ID =
  process.env.VITE_GOOGLE_CLIENT_ID ||
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
        <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 text-center">
          Google Login not configured — add VITE_GOOGLE_CLIENT_ID to .env
        </div>
      )}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#10221C]/50 border border-gray-200 dark:border-[#10B77F]/20 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#10B77F]/10 hover:border-[#10B77F]/40 transition-all text-sm font-bold shadow-sm hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed group"
        onClick={() => login()}
        disabled={isLoading || isClientIdPlaceholder}
      >
        <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm group-hover:scale-110 transition-transform">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-full h-full"
          />
        </div>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
};

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
        {/* Left: Interactive Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-20 overflow-hidden">
          {/* Background Image with sophisticated mask */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=2070&auto=format&fit=crop"
              alt="Elite Cycling"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-black/60 to-black z-10" />
            <div className="absolute inset-0 backdrop-blur-[2px] z-20" />
          </div>

          <div className="relative z-30 space-y-8 max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Global Marketplace Active
              </span>
            </div>

            <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
              Elevate Your <br />
              <span className="text-[#10B77F] drop-shadow-[0_0_15px_rgba(16,183,127,0.4)]">
                Ride.
              </span>
            </h2>

            <p className="text-xl text-gray-300 font-medium leading-relaxed">
              Join the elite circle of cyclists. Buy, sell, and discover premium
              machinery from around the globe.
            </p>

            <div className="pt-8 border-t border-white/10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden"
                  >
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-white tracking-tight">
                <span className="text-emerald-400">12.4k+</span> active riders{" "}
                <br />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                  In your local sector
                </span>
              </p>
            </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Right: Authentication Interface */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
          <div className="w-full max-w-md relative z-10">
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 dark:bg-[#10221C]/30 border border-gray-100 dark:border-[#10B77F]/10 rounded-2xl text-sm focus:border-[#10B77F] focus:ring-4 focus:ring-[#10B77F]/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    title="Initialize Recovery"
                    className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 uppercase tracking-widest transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 dark:bg-[#10221C]/30 border border-gray-100 dark:border-[#10B77F]/10 rounded-2xl text-sm focus:border-[#10B77F] focus:ring-4 focus:ring-[#10B77F]/5 transition-all outline-none font-medium text-gray-900 dark:text-white"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {displayError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-500 flex items-center gap-3 animate-shake">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                className="group relative w-full py-4 bg-[#10B77F] hover:bg-[#0EA572] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-glow hover:shadow-glow-strong disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

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
