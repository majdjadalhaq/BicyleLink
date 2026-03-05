import { memo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import ListingCard from "../../../components/ListingCard.jsx";
import { ListingCardSkeleton } from "../../../components/ui/SkeletonLoaders.jsx";

/**
 * ListingGrid Component
 * Handles the display of the bicycle listings and implements Infinite Scroll.
 */
const ListingGrid = ({
  listings,
  isLoading,
  hasMore,
  onLoadMore,
  gridCols = 3,
}) => {
  const scrollTriggerRef = useRef(null);

  // Setup Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }, // Start loading 200px before reaching bottom
    );

    if (scrollTriggerRef.current) {
      observer.observe(scrollTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="w-full">
      <div
        className="grid gap-5 p-1"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {/* Render actual listings */}
        {listings.map((listing, i) => {
          const row = Math.floor(i / gridCols);
          const col = i % gridCols;
          return (
            <motion.div
              key={`${listing._id}-${i}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{
                duration: 0.5,
                delay: Math.min(row * 0.1 + col * 0.05, 0.5), // Cap delay for many items
                ease: "easeOut",
              }}
              className="h-full"
            >
              <ListingCard listing={listing} />
            </motion.div>
          );
        })}

        {/* Render skeleton loaders when fetching more */}
        {isLoading &&
          [...Array(gridCols || 4)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="animate-in fade-in duration-500"
            >
              <ListingCardSkeleton />
            </div>
          ))}
      </div>

      {/* Invisible trigger for Infinite Scroll */}
      <div ref={scrollTriggerRef} className="h-10 w-full" aria-hidden="true" />

      {/* End of results message */}
      {!hasMore && listings.length > 0 && (
        <div className="mt-16 mb-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10 shadow-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              You&apos;ve seen all the rides in your area
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ListingGrid.propTypes = {
  listings: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  gridCols: PropTypes.number,
};

export default memo(ListingGrid);
