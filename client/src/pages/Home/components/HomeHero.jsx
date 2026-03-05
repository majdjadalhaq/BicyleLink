import { memo } from "react";
import PropTypes from "prop-types";

/**
 * HomeHero Component
 * Displays the main search area and welcome message with a premium background.
 */
const HomeHero = ({ searchTerm, onSearch }) => {
  return (
    <div
      className="relative overflow-hidden text-white text-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#FAFAF8] dark:from-gray-950/70 dark:via-gray-950/50 dark:to-[#121212]" />

      <div className="relative z-10 px-4 pt-14 pb-20 sm:pt-20 sm:pb-28 max-w-4xl mx-auto">
        <p className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-3">
          Pre-loved bicycle marketplace
        </p>
        <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight leading-[1.1]">
          Every ride
          <br />
          <span className="text-emerald-400">starts here.</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-lg mb-10 max-w-lg mx-auto">
          Buy and sell quality second-hand bikes in your area. Road, mountain,
          city, e-bikes & more.
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <label htmlFor="hero-search" className="sr-only">
              Search bikes, brands, and locations
            </label>
            <input
              id="hero-search"
              name="hero-search"
              type="text"
              placeholder="Search bikes, brands, locations..."
              value={searchTerm}
              onChange={onSearch}
              className="w-full pl-12 pr-4 py-4 text-sm sm:text-base rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all shadow-xl shadow-black/5 focus:bg-white/20 dark:focus:bg-white/15 focus:ring-4 focus:ring-[#10B77F]/10 focus:border-[#10B77F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

HomeHero.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default memo(HomeHero);
