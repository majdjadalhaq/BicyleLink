import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import StarRating from "../StarRating/StarRating";

const ProfileModal = ({ isOpen, onClose, seller, onMessage }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
        >
          {/* Top Banner Body */}
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 w-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="px-8 pb-10 pt-0 flex flex-col items-center -mt-12">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-[#1a1a1a] shadow-xl bg-emerald-500 flex items-center justify-center text-3xl font-black text-white">
                {seller.avatarUrl ? (
                  <img
                    src={seller.avatarUrl}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  seller.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {seller.name}
            </h2>

            <div className="mb-6 flex flex-col items-center">
              <StarRating
                rating={seller.averageRating}
                count={seller.reviewCount}
              />
            </div>

            {seller.bio && (
              <div className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl p-4 mb-8 text-center line-clamp-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed">
                  &ldquo;{seller.bio}&rdquo;
                </p>
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => {
                  onMessage();
                  onClose();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Contact Seller
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  seller: PropTypes.shape({
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    bio: PropTypes.string,
  }).isRequired,
  onMessage: PropTypes.func.isRequired,
};

export default ProfileModal;
