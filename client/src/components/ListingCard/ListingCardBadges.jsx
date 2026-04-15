import PropTypes from "prop-types";

const ListingCardBadges = ({ status, isFeatured, condition }) => {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
      {status === "sold" && (
        <div className="px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-red-500/80 backdrop-blur-md uppercase tracking-widest flex items-center gap-1.5 border border-white/20 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Sold
        </div>
      )}
      {isFeatured && (
        <div className="px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-amber-500/80 backdrop-blur-md uppercase tracking-widest flex items-center gap-1.5 border border-white/20 shadow-lg">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Featured
        </div>
      )}
      {condition && (
        <div className="px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-[#10B77F]/80 backdrop-blur-md uppercase tracking-[0.15em] border border-white/20 shadow-glow">
          {condition}
        </div>
      )}
    </div>
  );
};

ListingCardBadges.propTypes = {
  status: PropTypes.string,
  isFeatured: PropTypes.bool,
  condition: PropTypes.string,
};

export default ListingCardBadges;
