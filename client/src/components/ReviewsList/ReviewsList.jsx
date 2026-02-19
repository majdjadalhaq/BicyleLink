import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import "./ReviewsList.css";

const ReviewsList = ({
  userId,
  isOpen,
  onClose,
  userName,
  refreshTrigger,
  onReviewDeleted,
}) => {
  const { user } = useAuth();
  const page = 1;
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const {
    isLoading,
    error,
    performFetch: fetchReviews,
  } = useFetch(
    `/reviews/user/${userId}?page=${page}&limit=5`,
    (response) => {
      setReviews(response.result);
    },
    (err) => {
      console.error("Error fetching reviews:", err);
    },
  );

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, userId, page, refreshTrigger]);

  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });

      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? data.review : r)),
        );
        handleCancelEdit();
      } else {
        alert(data.msg || "Failed to update review");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating review");
    }
  };

  const handleDeleteClick = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        if (onReviewDeleted) onReviewDeleted();
      } else {
        alert(data.msg || "Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting review");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div
        className="reviews-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="reviews-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Reviews for {userName}</h2>

        {isLoading && <div className="reviews-loading">Loading reviews...</div>}
        {error && (
          <div className="reviews-error">Error: {error.toString()}</div>
        )}

        {!isLoading && !error && reviews.length === 0 && (
          <div className="reviews-empty">No reviews yet.</div>
        )}

        <div className="reviews-container">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.reviewerId?.avatarUrl ? (
                      <img
                        src={review.reviewerId.avatarUrl}
                        alt={review.reviewerId.name || "User"}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {review.reviewerId?.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <span className="reviewer-name">
                    {review.reviewerId?.name || "Unknown User"}
                  </span>
                </div>
                <div className="review-meta">
                  {editingReviewId === review._id ? (
                    <div className="edit-rating-input">
                      Rating:
                      <select
                        value={editRating}
                        onChange={(e) =>
                          setEditRating(parseInt(e.target.value, 10))
                        }
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} ★
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="review-rating">
                      {"★".repeat(review.rating)}
                      <span className="inactive-stars">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </div>
                  )}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="review-context">
                Purchased: {review.listingId?.title || "Item"}
              </div>

              {editingReviewId === review._id ? (
                <div className="edit-review-form">
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="edit-comment-input"
                    maxLength={500}
                  />
                  <div className="edit-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleSaveEdit(review._id)}
                    >
                      Save
                    </button>
                    <button className="btn-cancel" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  {user && user._id === review.reviewerId._id && (
                    <div className="review-actions">
                      <button
                        className="btn-action-edit"
                        onClick={() => handleEditClick(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-action-delete"
                        onClick={() => handleDeleteClick(review._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsList;
