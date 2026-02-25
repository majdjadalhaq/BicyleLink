import PropTypes from "prop-types";

const toastStyles = {
  success:
    "bg-success-light dark:bg-emerald-900/80 text-success-dark dark:text-emerald-200 border-emerald-500/30",
  error:
    "bg-danger-light dark:bg-red-900/80 text-danger-dark dark:text-red-200 border-red-500/30",
  info: "bg-info-light dark:bg-blue-900/80 text-info-dark dark:text-blue-200 border-blue-500/30",
};

const toastIcons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};
/**
 * Toast notification UI component.
 */
export const ToastContainer = ({ toasts, onDismiss }) => (
  <div
    className="fixed top-20 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
    aria-live="polite"
  >
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg animate-slideDown ${toastStyles[t.type] || toastStyles.info}`}
        role="alert"
      >
        <span className="text-lg font-bold flex-shrink-0">
          {toastIcons[t.type]}
        </span>
        <span className="flex-1 text-sm font-medium">{t.message}</span>
        <button
          type="button"
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
          onClick={() => onDismiss(t.id)}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["success", "error", "info"]).isRequired,
    }),
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default ToastContainer;
