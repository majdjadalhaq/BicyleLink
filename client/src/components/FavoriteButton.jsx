import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";

const FavoriteButton = ({ listingId, variant = "heart", onToggled }) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  const { performFetch: fetchIds, cancelFetch: cancelIds } = useFetch(
    "/favorites/ids",
    (data) => {
      const ids = data?.result || [];
      setIsFav(ids.includes(listingId));
    },
  );

  const { performFetch: toggleFav, cancelFetch: cancelToggle } = useFetch(
    `/favorites/${listingId}/toggle`,
    (data) => {
      const favorited = data?.result?.favorited;
      if (typeof favorited === "boolean") setIsFav(favorited);
      onToggled?.();
    },
  );

  useEffect(() => {
    if (user) {
      fetchIds({ method: "GET", credentials: "include" });
    }

    return () => {
      cancelIds();
      cancelToggle();
    };
  }, [listingId, user]);

  if (!user) {
    return null;
  }

  const handleToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    setLoading(true);

    const prev = isFav;
    setIsFav(!prev);

    try {
      await toggleFav({ method: "POST", credentials: "include" });
    } catch {
      setIsFav(prev);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500 shadow-sm active:scale-95"
        onClick={handleToggle}
        disabled={loading}
        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
        aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            Syncing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isFav ? "#10b981" : "none"}
              stroke={isFav ? "#10b981" : "currentColor"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isFav ? "Favorited" : "Add to Favorites"}
          </div>
        )}
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="text-xl transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
        aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isFav ? "#ef4444" : "none"}
          stroke={isFav ? "#ef4444" : "currentColor"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  }

  if (variant === "action-overlay") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="group flex items-center justify-center h-10 transition-all duration-300 rounded-full shadow-lg backdrop-blur-md bg-white/90 text-gray-800 dark:bg-[#1a1a1a]/90 dark:text-gray-200 hover:text-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
      >
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFav ? "#ef4444" : "none"}
            stroke={isFav ? "#ef4444" : "currentColor"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <div className="flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pr-4 group-hover:-ml-1">
          <span className="text-sm font-bold whitespace-nowrap">
            {isFav ? "Favorited" : "Favorite"}
          </span>
        </div>
      </button>
    );
  }

  // Default: heart variant
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 ${isFav ? "bg-red-500/10 animate-heartBeat" : "bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm shadow-sm"}`}
      aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isFav ? "#ef4444" : "none"}
        stroke={isFav ? "#ef4444" : "currentColor"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};

FavoriteButton.propTypes = {
  listingId: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["heart", "button", "icon", "action-overlay"]),
  onToggled: PropTypes.func,
};

export default FavoriteButton;
