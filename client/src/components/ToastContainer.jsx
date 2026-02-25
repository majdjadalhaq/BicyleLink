import PropTypes from "prop-types";

/**
 * Toast notification UI component.
 */
export const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="toast-container" aria-live="polite">
    {toasts.map((t) => (
      <div key={t.id} className={`toast toast--${t.type}`} role="alert">
        <span>{t.message}</span>
        <button
          type="button"
          className="toast__close"
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
