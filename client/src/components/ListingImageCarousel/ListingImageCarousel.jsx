import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { optimiseCloudinaryUrl } from "../../utils/cloudinary";

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

const ListingImageCarousel = ({ images = [], title = "Listing", status }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = useMemo(() => {
    return images && images.length > 0
      ? images.map((url) =>
          optimiseCloudinaryUrl(url, { width: 800, height: 600 }),
        )
      : [PLACEHOLDER];
  }, [images]);

  const prev = useCallback(
    () =>
      setActiveIndex(
        (i) => (i - 1 + displayImages.length) % displayImages.length,
      ),
    [displayImages.length],
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % displayImages.length),
    [displayImages.length],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, next, prev]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-gray-50 dark:bg-dark-input rounded-xl overflow-hidden flex items-center justify-center aspect-[4/3] w-full group">
        {displayImages.length > 1 && (
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 left-4 bg-white/80 dark:bg-dark-surface/80 border border-gray-200 dark:border-dark-border rounded-full w-10 h-10 flex items-center justify-center text-2xl cursor-pointer z-[2] transition-all text-gray-800 dark:text-gray-200 pb-1 hover:bg-white dark:hover:bg-dark-surface hover:shadow-md opacity-0 group-hover:opacity-100"
            onClick={prev}
          >
            ‹
          </button>
        )}

        <img
          src={displayImages[activeIndex]}
          alt={`${title} - View ${activeIndex + 1}`}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        />

        {displayImages.length > 1 && (
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/80 dark:bg-dark-surface/80 border border-gray-200 dark:border-dark-border rounded-full w-10 h-10 flex items-center justify-center text-2xl cursor-pointer z-[2] transition-all text-gray-800 dark:text-gray-200 pb-1 hover:bg-white dark:hover:bg-dark-surface hover:shadow-md opacity-0 group-hover:opacity-100"
            onClick={next}
          >
            ›
          </button>
        )}

        {status === "sold" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[15deg] bg-red-600/90 text-white px-8 py-4 text-4xl sm:text-5xl font-black border-4 border-white rounded-xl pointer-events-none z-[2] shadow-lg drop-shadow-md">
            SOLD
          </div>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 w-screen h-screen bg-black/90 flex justify-center items-center z-[2000] cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-5 right-5 bg-transparent border-none text-white text-5xl cursor-pointer z-[2001] leading-none transition-transform hover:scale-110"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <div
            className="relative max-w-[90%] max-h-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute top-1/2 -translate-y-1/2 -left-12 sm:-left-20 bg-white/20 border-none rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-4xl sm:text-5xl text-white cursor-pointer z-[2005] transition-all pb-2 hover:bg-white/40 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute top-1/2 -translate-y-1/2 -right-12 sm:-right-20 bg-white/20 border-none rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-4xl sm:text-5xl text-white cursor-pointer z-[2005] transition-all pb-2 hover:bg-white/40 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                >
                  ›
                </button>
              </>
            )}
            <img
              src={
                images[activeIndex]
                  ? optimiseCloudinaryUrl(images[activeIndex], {
                      width: 1600,
                      height: 1200,
                    })
                  : PLACEHOLDER
              }
              alt={title}
              className="max-w-full max-h-[90vh] object-contain rounded drop-shadow-2xl cursor-default"
            />
          </div>
        </div>
      )}

      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide shrink-0">
          {displayImages.map((img, index) => (
            <button
              type="button"
              key={index}
              className={`w-20 h-16 rounded-lg overflow-hidden cursor-pointer border-2 p-0 bg-transparent flex-shrink-0 transition-opacity duration-200 ${index === activeIndex ? "opacity-100 border-emerald" : "opacity-50 hover:opacity-80 border-transparent"}`}
              onClick={() => setActiveIndex(index)}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ListingImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  status: PropTypes.string,
};

export default ListingImageCarousel;
