import { useState } from "react";
import "./ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-content">
        <button className="review-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Rate Your Experience</h2>
        <p className="review-subtitle">
          How was your transaction with the seller?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="star-rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= rating ? "active" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="rating-text">
            {rating === 5 && "Excellent!"}
            {rating === 4 && "Good"}
            {rating === 3 && "Average"}
            {rating === 2 && "Poor"}
            {rating === 1 && "Terrible"}
          </div>

          <textarea
            className="review-comment-input"
            placeholder="Write a brief comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
          />

          <div className="review-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
