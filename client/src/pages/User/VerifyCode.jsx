import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import { useAuth } from "../../hooks/useAuth";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onResendSuccess = () => {
    setTimer(60);
  };

  const {
    isLoading: isResending,
    error: resendError,
    performFetch: performResend,
  } = useFetch("/users/resend-code", onResendSuccess);

  const handleResend = () => {
    performResend({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });
  };

  const { login } = useAuth();

  const onSuccess = (data) => {
    if (data?.user) {
      login(data.user);
    }
    navigate("/profile/setup");
  };

  const { isLoading, error, performFetch } = useFetch(
    "/users/verify",
    onSuccess,
  );

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      // Basic client validation
    }
    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });
  };

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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We sent a verification code to{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {email}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            name="code"
            value={code}
            onChange={setCode}
            placeholder="Enter 6-digit code"
            autoComplete="one-time-code"
            className="text-center text-2xl tracking-[0.2em] font-medium"
          />
          <SubmitButton
            isLoading={isLoading}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl tracking-wide transition-colors shadow-md shadow-emerald/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface"
          >
            Verify Email
          </SubmitButton>
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

        <div className="mt-8 text-center">
          <button
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            type="button"
            className={`text-sm font-medium transition-colors ${
              timer > 0 || isResending
                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "text-emerald-500 hover:text-emerald-400 cursor-pointer"
            }`}
          >
            {isResending
              ? "Sending..."
              : timer > 0
                ? `Resend code in ${timer}s`
                : "Didn't receive a code? Resend"}
          </button>

          {resendError && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">
              {resendError.toString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
