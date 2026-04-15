import { useState, useEffect, useRef } from "react";

const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  targetTitle,
}) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setReason("");
        setCustomReason("");
      }, 0);
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const reasons = [
    "Inappropriate content",
    "Suspected scam",
    "Wrong category",
    "Item already sold",
    "Misleading information",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason.trim()) return;
    onSubmit(finalReason);
  };

  return (
    <div className="overlay-backdrop" onClick={onClose} aria-hidden="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          ref={dialogRef}
          className="overlay-panel w-full max-w-md p-6 sm:p-8 relative"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <button
            className="absolute top-4 right-4 btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Close report dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2
            id="report-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white mb-1"
          >
            Report Listing
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Help us keep our marketplace safe. Why are you reporting{" "}
            <strong className="text-gray-700 dark:text-gray-200">
              {targetTitle}
            </strong>
            ?
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mb-6">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${reason === r ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10" : "border-light-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${reason === r ? "border-emerald-500" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    {reason === r && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {r}
                  </span>
                </label>
              ))}
            </div>

            {reason === "Other" && (
              <textarea
                className="input-emerald resize-none mb-6"
                placeholder="Please describe the issue..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={200}
                rows={3}
                required
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn-ghost px-5 py-2.5"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-destructive px-6 py-2.5"
                disabled={
                  isSubmitting ||
                  !reason ||
                  (reason === "Other" && !customReason.trim())
                }
              >
                {isSubmitting ? "Submitting..." : "Send Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
