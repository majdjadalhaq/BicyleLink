import PropTypes from "prop-types";
import { motion } from "framer-motion";
import ListingCard from "../../../components/ListingCard/ListingCard";
import EmptyState from "../../../components/ui/EmptyState/EmptyState";
import BicycleLoading from "../../../components/ui/BicycleLoading";

const FavoritesResults = ({
  isLoading,
  error,
  favorites,
  debouncedSearchTerm,
  activeFilterCount,
  handleClearFilters,
  loadFavorites,
}) => {
  if (isLoading && favorites.length === 0) {
    return (
      <div className="py-20 flex items-center justify-center">
        <BicycleLoading message="Retrieving your collection..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-red-50 dark:bg-red-500/10 p-8 rounded-[2.5rem] text-center border border-red-100 dark:border-red-500/20">
        <div className="flex justify-center mb-4 text-red-500">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-6">
          {error.toString()}
        </p>
        <button
          onClick={loadFavorites}
          className="px-8 py-3 bg-red-600 dark:bg-red-500 text-white rounded-2xl hover:bg-red-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!isLoading && favorites.length === 0) {
    return (
      <div className="py-20">
        <EmptyState
          title={
            debouncedSearchTerm || activeFilterCount > 0
              ? "No matches found"
              : "Your heart is empty"
          }
          message={
            debouncedSearchTerm || activeFilterCount > 0
              ? "Try adjusting your filters to find your favorites."
              : "Discover amazing bikes and save them here by clicking the heart button."
          }
          icon={
            debouncedSearchTerm || activeFilterCount > 0 ? (
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : (
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
                <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
                <path d="M12 6V3" />
              </svg>
            )
          }
          actionLabel={
            debouncedSearchTerm || activeFilterCount > 0
              ? "Clear Filters"
              : "Explore Marketplace"
          }
          actionLink={debouncedSearchTerm || activeFilterCount > 0 ? null : "/"}
          onActionClick={
            debouncedSearchTerm || activeFilterCount > 0
              ? handleClearFilters
              : null
          }
        />
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
    >
      {favorites.map((listing, i) => (
        <motion.div
          key={listing._id}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          transition={{
            duration: 0.8,
            delay: (i % 8) * 0.1,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="relative group h-full"
        >
          <ListingCard listing={listing} />
        </motion.div>
      ))}
    </div>
  );
};

FavoritesResults.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  favorites: PropTypes.array.isRequired,
  debouncedSearchTerm: PropTypes.string,
  activeFilterCount: PropTypes.number.isRequired,
  handleClearFilters: PropTypes.func.isRequired,
  loadFavorites: PropTypes.func.isRequired,
};

export default FavoritesResults;
