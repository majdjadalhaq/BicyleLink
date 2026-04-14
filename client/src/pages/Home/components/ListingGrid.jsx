import { memo, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "../../../components/ListingCard.jsx";
import { ListingCardSkeleton } from "../../../components/ui/SkeletonLoaders.jsx";

/**
 * Optimized ListingGrid.
 * Focuses on minimizing layout thrash and long-task violations during staggered reveals.
 */
const ListingGrid = ({
  listings,
  isLoading,
  hasMore,
  onLoadMore,
  gridCols = 3,
}) => {
  const scrollTriggerRef = useRef(null);

  // Memoize variants to prevent re-calculation on grid re-renders
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Increased for smoother main-thread distribution
        delayChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 180, // Lowered for easier physics resolution
        damping: 25,
      },
    },
  }), []);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "400px" }, // More aggressive loading to avoid sudden pops
    );

    if (scrollTriggerRef.current) {
      observer.observe(scrollTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout="position" // Optimize for position-only transforms
        className="grid gap-5 p-1"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        }}
      >
        <AnimatePresence mode="popLayout">
          {listings.map((listing) => (
            <motion.div
              layout
              key={listing._id}
              variants={itemVariants}
              className="h-full will-change-transform" // Move reveal to GPU
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading &&
          [...Array(gridCols || 4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-in fade-in duration-500">
              <ListingCardSkeleton />
            </div>
          ))}
      </motion.div>

      <div ref={scrollTriggerRef} className="h-20 w-full" aria-hidden="true" />
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
