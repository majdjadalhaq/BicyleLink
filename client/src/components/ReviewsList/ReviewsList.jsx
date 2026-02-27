import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const ReviewsList = ({
  userId,
  isOpen,
  onClose,
  userName,
  refreshTrigger,
  onReviewDeleted,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const page = 1;
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const { execute: executeApi } = useApi();

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
    const data = await executeApi(`/api/reviews/${reviewId}`, {
      method: "PUT",
      body: { rating: editRating, comment: editComment },
    });

    if (data?.success) {
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? data.review : r)),
      );
      handleCancelEdit();
    } else {
      toast({
        title: "Update failed",
        description: data?.msg || "Failed to update review",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteClick = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    const data = await executeApi(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });

    if (data?.success) {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      if (onReviewDeleted) onReviewDeleted();
    } else {
      alert(data?.msg || "Failed to delete review");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="overlay-panel w-full max-w-lg max-h-[80vh] flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Reviews for {userName}
            </h2>
            <button
              className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-emerald-500 animate-pulse font-medium">
                  Loading reviews...
                </p>
              </div>
            )}
            {error && (
              <div className="bg-danger/10 text-danger border border-danger/20 px-4 py-3 rounded-xl text-sm">
                Error: {error.toString()}
              </div>
            )}

            {!isLoading && !error && reviews.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No reviews yet.
              </div>
            )}

            {reviews.map((review) => (
              <div
                key={review._id}
                className="p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-input flex-shrink-0">
                      {review.reviewerId?.avatarUrl ? (
                        <img
                          src={review.reviewerId.avatarUrl}
                          alt={review.reviewerId.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                          {review.reviewerId?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                        {review.reviewerId?.name || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    {editingReviewId === review._id ? (
                      <select
                        value={editRating}
                        onChange={(e) =>
                          setEditRating(parseInt(e.target.value, 10))
                        }
                        className="input-emerald text-sm py-1 px-2 w-auto"
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} ★
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`text-sm ${s <= review.rating ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-emerald-500 font-medium mb-2">
                  Purchased: {review.listingId?.title || "Item"}
                </p>

                {editingReviewId === review._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="input-emerald resize-none text-sm"
                      maxLength={500}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-1.5 text-sm font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        onClick={() => handleSaveEdit(review._id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn-ghost text-sm px-4 py-1.5"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {review.comment && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    {user && user._id === review.reviewerId._id && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                        <button
                          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
                          onClick={() => handleEditClick(review)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
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
    </div>
  );
};

export default ReviewsList;
