import { useState } from "react";
import PropTypes from "prop-types";

const ReviewModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  const ratingLabels = [
    "",
    "Terrible",
    "Poor",
    "Average",
    "Good",
    "Excellent!",
  ];

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="overlay-panel w-full max-w-md p-6 sm:p-8 relative"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Close"
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

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Rate Your Experience
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            How was your transaction with the seller?
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl transition-all duration-200 hover:scale-110 ${star <= rating ? "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" : "text-gray-300 dark:text-gray-600"}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="text-center text-sm font-semibold text-emerald-500 mb-6">
              {ratingLabels[rating]}
            </div>

            <textarea
              className="input-emerald resize-none mb-6"
              placeholder="Write a brief comment (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
            />

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
                className="btn-primary px-6 py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default ReviewModal;
