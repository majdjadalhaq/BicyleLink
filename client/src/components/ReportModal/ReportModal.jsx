import { useState, useEffect } from "react";
import "./ReportModal.css";

const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  targetTitle,
}) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setReason("");
        setCustomReason("");
      }, 0);
    }
  }, [isOpen]);

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
    <div className="report-modal-overlay">
      <div className="report-modal-content">
        <button
          className="report-modal-close"
          onClick={onClose}
          aria-label="Close report dialog"
        >
          &times;
        </button>
        <h2>Report Listing</h2>
        <p className="report-subtitle">
          Help us keep our marketplace safe. Why are you reporting{" "}
          <strong>{targetTitle}</strong>?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="report-reasons-list">
            {reasons.map((r) => (
              <label key={r} className="report-reason-item">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {reason === "Other" && (
            <textarea
              className="report-custom-input"
              placeholder="Please describe the issue..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              maxLength={200}
              rows={3}
              required
            />
          )}

          <div className="report-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--danger"
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
  );
};

export default ReportModal;
