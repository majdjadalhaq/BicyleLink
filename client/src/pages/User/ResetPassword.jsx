import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const onSuccess = () => {
    navigate("/login");
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/reset-password",
    onSuccess,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!code || !newPassword || !confirmPassword) {
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

    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
        newPassword,
      }),
    });
  };

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-dark-surface p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-dark-border rounded-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 mb-4">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid Access
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Please request a password reset link first.
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
            className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-dark-border rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 mb-4">
            <svg
              className="h-8 w-8 text-emerald-500 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Set new password
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter the code sent to{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {email}
            </span>{" "}
            and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            name="code"
            label="Verification Code"
            value={code}
            onChange={setCode}
            placeholder="6-digit verification code"
            autoComplete="one-time-code"
            className="text-center text-xl tracking-widest font-medium"
          />
          <InputField
            name="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="New password (min 8 chars)"
            autoComplete="new-password"
          />

          <div className="-mt-2 mb-2">
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <InputField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />

          {validationError && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
              {validationError}
            </div>
          )}

          <div className="pt-2">
            <SubmitButton
              isLoading={isLoading}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl tracking-wide transition-colors shadow-md shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface"
            >
              Reset Password
            </SubmitButton>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error.toString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
