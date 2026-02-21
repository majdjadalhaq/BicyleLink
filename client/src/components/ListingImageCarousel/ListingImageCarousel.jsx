import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { optimiseCloudinaryUrl } from "../../utils/cloudinary";

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

/**
 * Image carousel for a listing's photos.
 *
 * @param {object} props
 * @param {string[]} props.images - Array of image URLs.
 * @param {string} props.title - Listing title (used for alt text).
 * @param {string} props.status - Listing status ("active" | "sold" | "cancelled").
 */
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

  // Keyboard navigation for Carousel and Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
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
    <div className="carousel-container listing-image-carousel">
      <div className="main-image-wrapper">
        {displayImages.length > 1 && (
          <button type="button" className="nav-arrow left" onClick={prev}>
            ‹
          </button>
        )}

        <img
          src={displayImages[activeIndex]}
          alt={`${title} - View ${activeIndex + 1}`}
          className="listing-main-image"
          onClick={() => setIsLightboxOpen(true)}
          style={{ cursor: "zoom-in" }}
        />

        {displayImages.length > 1 && (
          <button type="button" className="nav-arrow right" onClick={next}>
            ›
          </button>
        )}

        {status === "sold" && <div className="sold-overlay">SOLD</div>}
      </div>

      {isLightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav-arrow left"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox-nav-arrow right"
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
              className="lightbox-image"
            />
          </div>
        </div>
      )}

      {displayImages.length > 1 && (
        <div className="thumbnail-strip">
          {displayImages.map((img, index) => (
            <button
              type="button"
              key={index}
              className={`thumbnail ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} />
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
