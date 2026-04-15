import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { optimiseCloudinaryUrl } from "../../utils/cloudinary";
import { BACKEND_URL } from "../../utils/config";

const CardCarousel = ({ images, title }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  const imageUrls = images.map((img) => {
    let url = img;
    // Handle relative paths (e.g. from local uploads)
    if (url && !url.startsWith("http") && !url.startsWith("data:")) {
      const baseUrl = BACKEND_URL || "";
      url = `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return optimiseCloudinaryUrl(url, {
      width: 600,
      height: 450,
      crop: "fill",
    });
  });

  const handleImageError = (e) => {
    // Fallback to a nice bike placeholder if the image fails to load
    e.target.src =
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&h=450&auto=format&fit=crop";
    e.target.onerror = null; // Prevent infinite loop
  };

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
  };

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i === imageUrls.length - 1 ? 0 : i + 1));
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setIdx((i) => (i === imageUrls.length - 1 ? 0 : i + 1));
      else setIdx((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {imageUrls.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`${title} — photo ${i + 1}`}
          loading="lazy"
          onError={handleImageError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            i === idx
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
        />
      ))}

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:bg-emerald-500"
            aria-label="Previous photo"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:bg-emerald-500"
            aria-label="Next photo"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            {imageUrls.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-500 rounded-full h-1 ${
                  i === idx ? "w-4 bg-white" : "w-1 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

CardCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
};

export default CardCarousel;
