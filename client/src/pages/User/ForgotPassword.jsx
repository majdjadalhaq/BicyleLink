import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useApi from "../../hooks/useApi";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import {
  FaEnvelope,
  FaKey,
  FaUnlockAlt,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";

const STEPS = [
  { id: 1, title: "Email", icon: FaEnvelope },
  { id: 2, title: "Verification", icon: FaKey },
  { id: 3, title: "New Password", icon: FaUnlockAlt },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { execute, isLoading, error } = useApi();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleNext = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (step === 1) {
      if (!email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
        setValidationError("Please enter a valid email address");
        return;
      }

      const res = await execute("/users/request-reset", {
        method: "POST",
        body: { email },
      });
      if (res?.success) setStep(2);
    } else if (step === 2) {
      if (!code.trim() || code.length < 6) {
        setValidationError("Please enter the 6-digit verification code");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!newPassword || !confirmPassword) {
        setValidationError("All fields are required");
        return;
      }
      if (newPassword !== confirmPassword) {
        setValidationError("Passwords do not match");
        return;
      }
      if (newPassword.length < 8) {
        setValidationError("Password must be at least 8 characters");
        return;
      }

      const res = await execute("/users/reset-password", {
        method: "POST",
        body: { email, code, newPassword },
      });

      if (res?.success) {
        navigate("/login", { replace: true });
      }
    }
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) setStep(step - 1);
    else navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg">
      <div className="w-full max-w-md bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8 relative overflow-hidden">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -mt-[1px] w-full h-[2px] bg-gray-200 dark:bg-gray-700 z-0"></div>
            <div
              className="absolute left-0 top-1/2 -mt-[1px] h-[2px] bg-emerald-500 z-0 transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>

            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <div
                  key={s.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isPast || isActive ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}
                  >
                    {isPast ? <FaCheck size={14} /> : <Icon size={14} />}
                  </div>
                  <span
                    className={`text-[10px] font-medium absolute -bottom-5 w-24 text-center transition-colors ${isActive ? "text-emerald-500" : "text-gray-400"}`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-8 mt-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 1
              ? "Reset Password"
              : step === 2
                ? "Verify Email"
                : "Create New Password"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 1
              ? "Enter your email to receive a reset code."
              : step === 2
                ? `Enter the 6-digit code sent to ${email}.`
                : "Secure your account with a strong password."}
          </p>
        </div>

        <form
          onSubmit={handleNext}
          className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
          key={step}
        >
          {step === 1 && (
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
                placeholder="Enter your email"
                className="w-full bg-light-input dark:bg-dark-input border border-emerald-500/40 focus:border-emerald-500 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-base outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-1.5 focus-within:text-emerald-500 text-gray-400">
              <label
                htmlFor="code"
                className="text-sm font-medium ml-1 transition-colors"
              >
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="6-Digit Code"
                className="w-full bg-light-input dark:bg-dark-input border border-emerald-500/40 focus:border-emerald-500 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-center tracking-widest text-lg font-bold outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500 uppercase"
                maxLength={6}
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col gap-1.5 focus-within:text-emerald-500 text-gray-400">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium ml-1 transition-colors"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password (min 8 chars)"
                  className="w-full bg-light-input dark:bg-dark-input border border-emerald-500/40 focus:border-emerald-500 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-base outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div className="-mt-1 mb-2">
                <PasswordStrengthMeter password={newPassword} />
              </div>
              <div className="flex flex-col gap-1.5 focus-within:text-emerald-500 text-gray-400">
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
                  className="w-full bg-light-input dark:bg-dark-input border border-emerald-500/40 focus:border-emerald-500 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-base outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          {(validationError || error) && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 dark:text-red-400 text-center flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
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
              {validationError || error.toString()}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="px-4 py-3.5 bg-gray-100 dark:bg-dark-input hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <FaArrowLeft />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : step === 3 ? (
                "Complete Reset"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>

        {step === 1 && (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Remember your password? Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
