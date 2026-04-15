import PropTypes from "prop-types";

/**
 * High-bleed profile banner with glassmorphic statistics overlay.
 */
const ProfileBanner = ({ listingsCount, soldCount, averageRating }) => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full h-48 sm:h-64 relative overflow-hidden bg-[#10221C] border-b border-[#10B77F]/20">
      <div className="absolute inset-0 z-0">
        <img
          src="/premium_cycling_cover_1772204408302.png"
          alt="Elite Cycling"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#10221C]/60 via-[#08120F]/40 to-[#10B77F]/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF8] dark:from-[#121212] via-transparent to-transparent z-20" />
      </div>

      <div className="absolute inset-0 z-30 opacity-70" />

      {/* Profile Statistics Glass Banner */}
      <div className="absolute bottom-6 right-6 z-40 hidden md:flex items-center gap-3 animate-reveal">
        <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-6">
          <button
            onClick={() => scrollTo("profile-listings")}
            className="flex flex-col items-center px-2 border-r border-white/5 hover:scale-105 hover:text-emerald-300 transition-all group"
          >
            <span className="text-2xl font-black text-white leading-none group-hover:text-emerald-400 transition-colors">
              {listingsCount}
            </span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all">
              Listings
            </span>
          </button>

          <div className="flex flex-col items-center px-2 border-r border-white/5">
            <span className="text-2xl font-black text-white leading-none">
              {soldCount}
            </span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 grayscale opacity-70">
              Sold
            </span>
          </div>

          <button
            onClick={() => scrollTo("profile-reviews")}
            className="flex flex-col items-center px-2 hover:scale-105 transition-all group"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-white leading-none group-hover:text-amber-400 transition-colors">
                {Number(averageRating || 0).toFixed(1)}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#f59e0b"
                className="mb-0.5 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1.5 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all">
              Rating
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

ProfileBanner.propTypes = {
  listingsCount: PropTypes.number,
  soldCount: PropTypes.number,
  averageRating: PropTypes.number,
};

export default ProfileBanner;
