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
            className="absolute top-1/2 -translate-y-1/2 left-4 bg-white/90 dark:bg-[#1a1a1a]/90 border border-gray-200 dark:border-[#2a2a2a] rounded-full w-12 h-12 flex items-center justify-center text-3xl cursor-pointer z-[2] transition-all text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-[#1a1a1a] hover:text-emerald-600 dark:hover:text-emerald-500 hover:shadow-xl opacity-0 group-hover:opacity-100 active:scale-90"
            onClick={prev}
            title="Previous Image"
            aria-label="Previous Image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <img
          src={displayImages[activeIndex]}
          alt={`${title} - View ${activeIndex + 1}`}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
          fetchPriority={activeIndex === 0 ? "high" : "auto"}
          loading={activeIndex === 0 ? "eager" : "lazy"}
        />

        {displayImages.length > 1 && (
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/90 dark:bg-[#1a1a1a]/90 border border-gray-200 dark:border-[#2a2a2a] rounded-full w-12 h-12 flex items-center justify-center text-3xl cursor-pointer z-[2] transition-all text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-[#1a1a1a] hover:text-emerald-600 dark:hover:text-emerald-500 hover:shadow-xl opacity-0 group-hover:opacity-100 active:scale-90"
            onClick={next}
            title="Next Image"
            aria-label="Next Image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {status === "sold" && (
          <div className="absolute inset-0 z-[10] flex items-center justify-center p-6 pointer-events-none">
            <div className="absolute inset-0 bg-red-600/20 dark:bg-red-500/20 backdrop-blur-sm" />
            <div className="relative -rotate-12 px-10 py-5 bg-red-600 text-white text-4xl sm:text-5xl font-black rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.5)] border-4 border-white/30 scale-110">
              SOLD OUT
            </div>
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
            aria-label="Close Lightbox"
            title="Close Lightbox"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
                  title="Previous Image"
                  aria-label="Previous Image"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="absolute top-1/2 -translate-y-1/2 -right-12 sm:-right-20 bg-white/20 border-none rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-4xl sm:text-5xl text-white cursor-pointer z-[2005] transition-all pb-2 hover:bg-white/40 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  title="Next Image"
                  aria-label="Next Image"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
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
              className={`w-20 h-16 rounded-xl overflow-hidden cursor-pointer border-2 p-0 bg-transparent flex-shrink-0 transition-all duration-300 ${index === activeIndex ? "opacity-100 border-emerald-600 dark:border-emerald-500 scale-105 shadow-md" : "opacity-40 hover:opacity-70 border-transparent hover:scale-105"}`}
              onClick={() => setActiveIndex(index)}
              title={`View Image ${index + 1}`}
              aria-label={`View Image ${index + 1}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
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
