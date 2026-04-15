import PropTypes from "prop-types";
import { Link } from "react-router";
import { motion } from "framer-motion";

const ListingErrorState = ({ error }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 mb-6 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </motion.div>
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
        Listing Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        {error ||
          "The bicycle you're looking for might have been sold, removed, or the link is broken."}
      </p>
      <Link to="/" className="btn-primary">
        Back to Garage
      </Link>
    </div>
  );
};

ListingErrorState.propTypes = {
  error: PropTypes.string,
};

export default ListingErrorState;
