import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";

const FavoriteButton = ({ listingId, variant, onToggled }) => {
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
        className="btn-favorite"
        onClick={handleToggle}
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : isFav
            ? "Remove from Favorites"
            : "Add to Favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={isFav ? "btn-heart active" : "btn-heart"}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        border: "none",
        background: "rgba(255, 255, 255, 0.85)",
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 10,
        transition: "all 0.2s ease",
        color: isFav ? "#e74c3c" : "#ccc", // Red if fav, gray if not
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.background = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
      }}
    >
      {isFav ? "❤️" : "🤍"}
    </button>
  );
};

FavoriteButton.propTypes = {
  listingId: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["heart", "button"]),
  onToggled: PropTypes.func,
};

FavoriteButton.defaultProps = {
  variant: "heart",
  onToggled: null,
};

export default FavoriteButton;
