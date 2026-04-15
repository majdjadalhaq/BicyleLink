import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { DURATIONS, EASINGS, STAGGER } from "../../../constants/animations";

const ListingCard = lazy(
  () => import("../../../components/ListingCard/ListingCard"),
);

/**
 * Grid of user listings with motion entrance animations.
 */
const ProfileListings = ({ listings, gridRef, gridCols }) => {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/5">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 dark:text-gray-700 mb-3"
        >
          <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
          <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
          <path d="M12 6V3" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">No listings yet</p>
      </div>
    );
  }

  return (
    <section id="profile-listings" className="scroll-mt-24">
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Listings
        <span className="text-sm font-bold text-gray-400">
          ({listings.length})
        </span>
      </h2>

      <div
        ref={gridRef}
        className="grid gap-5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        <Suspense
          fallback={
            <div className="col-span-full h-32 animate-pulse bg-gray-100 dark:bg-white/5 rounded-2xl" />
          }
        >
          {listings.map((l, i) => {
            const row = Math.floor(i / gridCols);
            const col = i % gridCols;
            return (
              <motion.div
                key={l._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATIONS.SLOW,
                  delay: row * STAGGER.SLOW + col * STAGGER.NORMAL,
                  ease: EASINGS.OUT,
                }}
              >
                <ListingCard listing={l} />
              </motion.div>
            );
          })}
        </Suspense>
      </div>
    </section>
  );
};

ProfileListings.propTypes = {
  listings: PropTypes.array.isRequired,
  gridRef: PropTypes.object.isRequired,
  gridCols: PropTypes.number.isRequired,
};

export default ProfileListings;
