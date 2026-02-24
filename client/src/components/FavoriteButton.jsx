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
