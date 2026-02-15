import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  const onSuccess = (data) => {
    setFavorites(data.result || []);
  };

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/favorites",
    onSuccess,
  );

  useEffect(() => {
    performFetch({
      method: "GET",
      credentials: "include",
    });

    return cancelFetch;
  }, []);

  if (isLoading) return <p>Loading favorites...</p>;
  if (error) return <p>{error.toString()}</p>;

  return (
    <div>
      <h1>My Favorites</h1>

      {favorites.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <ul>
          {favorites.map((l) => (
            <li key={l._id}>
              <strong>{l.title}</strong> — {String(l.price)}
              {/* <Link to={`/listings/${l._id}`}>View</Link> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
