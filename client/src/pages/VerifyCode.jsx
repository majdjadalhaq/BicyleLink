import { useLocation, Link } from "react-router";
import TEST_ID from "./VerifyCode.testid";

const VerifyCode = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div
      className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg"
      data-testid={TEST_ID.container}
    >
      <div className="max-w-md w-full bg-light-surface dark:bg-dark-surface p-8 sm:p-10 shadow-xl border border-light-border dark:border-dark-border rounded-2xl text-center animate-fadeIn">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 mb-6">
          <svg
            className="h-8 w-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          data-testid={TEST_ID.title}
        >
          Verify Your Email
        </h1>

        <p
          className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
          data-testid={TEST_ID.message}
        >
          A verification code has been sent to{" "}
          <strong className="text-gray-700 dark:text-gray-200">{email}</strong>.
          <br />
          Please check your email (or the server console in development mode)
          for the 5-digit code.
        </p>

        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            <em>
              Note: Email verification feature is under development. For now,
              check the backend server console for your verification code.
            </em>
          </p>
        </div>

        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Signup
        </Link>
      </div>
    </div>
  );
};

export default VerifyCode;
