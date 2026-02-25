import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";

const FavoriteButton = ({ listingId, variant = "heart", onToggled }) => {
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
    fetchIds({ method: "GET", credentials: "include" });

    return () => {
      cancelIds();
      cancelToggle();
    };
  }, [listingId]);

  const handleToggle = async () => {
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
        className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500"
        onClick={handleToggle}
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : isFav
            ? "💚 Remove from Favorites"
            : "🤍 Add to Favorites"}
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="text-xl transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        {isFav ? "❤️" : "🤍"}
      </button>
    );
  }

  // Default: heart variant
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 ${isFav ? "bg-red-500/10 animate-heartBeat" : "bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm"}`}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      {isFav ? "❤️" : "🤍"}
    </button>
  );
};

FavoriteButton.propTypes = {
  listingId: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["heart", "button", "icon"]),
  onToggled: PropTypes.func,
};

export default FavoriteButton;
