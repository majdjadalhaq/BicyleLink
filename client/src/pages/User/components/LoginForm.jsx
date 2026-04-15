import PropTypes from "prop-types";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = ({
  handleSubmit,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  displayError,
}) => {
  return (
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
  );
};

LoginForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  setShowPassword: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  displayError: PropTypes.string,
};

export default LoginForm;
