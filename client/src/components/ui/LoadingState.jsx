import PropTypes from "prop-types";

const LoadingState = ({
  variant = "page",
  message = "Loading...",
  className = "",
}) => {
  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-2 text-emerald-500 ${className}`}
        role="status"
        aria-live="polite"
      >
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={`space-y-4 animate-pulse ${className}`} role="status">
        <div className="h-48 bg-gray-200 dark:bg-dark-surface rounded-2xl" />
        <div className="h-4 bg-gray-200 dark:bg-dark-surface rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-dark-surface rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-32 bg-gray-200 dark:bg-dark-surface rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-dark-surface rounded-xl" />
        </div>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  // Default: page variant — centered spinner
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-dark-border" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-muted animate-pulse">
        {message}
      </p>
    </div>
  );
};

LoadingState.propTypes = {
  variant: PropTypes.oneOf(["page", "inline", "skeleton"]),
  message: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingState;
