import { useState } from "react";
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

  const displayImages =
    images && images.length > 0
      ? images.map((url) =>
          optimiseCloudinaryUrl(url, { width: 800, height: 600 }),
        )
      : [PLACEHOLDER];

  const prev = () =>
    setActiveIndex(
      (i) => (i - 1 + displayImages.length) % displayImages.length,
    );
  const next = () => setActiveIndex((i) => (i + 1) % displayImages.length);

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
        />

        {displayImages.length > 1 && (
          <button type="button" className="nav-arrow right" onClick={next}>
            ›
          </button>
        )}

        {status === "sold" && <div className="sold-overlay">SOLD</div>}
      </div>

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

export default ListingImageCarousel;
