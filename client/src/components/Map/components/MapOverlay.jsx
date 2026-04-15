import PropTypes from "prop-types";

const MapOverlay = ({
  geoError,
  userDistance,
  userPosition,
  handleLocate,
  isLocating,
  handleOpenInMaps,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-4 w-full">
        <div className="space-y-2 pointer-events-auto">
          {geoError && (
            <div className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
              {geoError}
            </div>
          )}

          {userDistance !== null && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl transition-transform hover:scale-105">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
                {userDistance} KM RANGE
              </span>
            </div>
          )}
        </div>

        <div className="pointer-events-auto">
          {!userPosition ? (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
              onClick={handleLocate}
              disabled={isLocating}
              title="Detect my current location"
              aria-label="Detect my current location"
            >
              {isLocating ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Detect Location
                </div>
              )}
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-[0.15em] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95"
              onClick={handleOpenInMaps}
              title="Open location in Google Maps"
              aria-label="Open location in Google Maps"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Google Maps
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

MapOverlay.propTypes = {
  geoError: PropTypes.string,
  userDistance: PropTypes.string,
  userPosition: PropTypes.array,
  handleLocate: PropTypes.func.isRequired,
  isLocating: PropTypes.bool.isRequired,
  handleOpenInMaps: PropTypes.func.isRequired,
};

export default MapOverlay;
