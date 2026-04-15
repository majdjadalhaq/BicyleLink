import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import PasswordStrengthMeter from "../../../components/PasswordStrengthMeter";

const SignupForm = ({
  handleSubmit,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  displayError,
  TEST_ID,
}) => {
  return (
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
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
  );
};

SignupForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  confirmPassword: PropTypes.string.isRequired,
  setConfirmPassword: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  setShowPassword: PropTypes.func.isRequired,
  showConfirmPassword: PropTypes.bool.isRequired,
  setShowConfirmPassword: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  displayError: PropTypes.string,
  TEST_ID: PropTypes.object.isRequired,
};

export default SignupForm;
