const ErrorIcon = ({ children }) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const defaultIcons = {
  emerald: (
    <ErrorIcon>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </ErrorIcon>
  ),
  amber: (
    <ErrorIcon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </ErrorIcon>
  ),
  red: (
    <ErrorIcon>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </ErrorIcon>
  ),
};

const AdminErrorState = ({
  error,
  onRetry,
  title = "Error",
  buttonText = "Retry",
  color = "emerald",
  icon,
}) => {
  const colors = {
    emerald: {
      iconColor: "text-emerald-500",
      buttonBg:
        "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20",
    },
    amber: {
      iconColor: "text-amber-500",
      buttonBg: "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20",
    },
    red: {
      iconColor: "text-red-500",
      buttonBg: "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20",
    },
  };

  const c = colors[color] || colors.emerald;

  return (
    <div className="max-w-2xl mx-auto p-12 mt-12 bg-white dark:bg-[#1a1a1a] border border-red-100 dark:border-red-900/20 rounded-[2.5rem] text-center shadow-xl">
      <div className={`flex justify-center mb-6 ${c.iconColor}`}>
        {icon || defaultIcons[color] || defaultIcons.emerald}
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
        {error}
      </p>
      <button
        onClick={onRetry}
        className={`px-8 py-3.5 ${c.buttonBg} text-white rounded-2xl font-bold transition-all active:scale-95`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default AdminErrorState;
