import PropTypes from "prop-types";
import { VIEW_MODE } from "../mapConstants";

const PinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MapHeader = ({ title, viewMode, setViewMode, userPosition }) => {
  return (
    <div className="location-map-header sticky top-16 md:static z-[45] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl px-4 py-3 md:px-0 md:py-0 md:mb-4 border-b border-gray-100 dark:border-white/5 md:border-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <PinIcon />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">
              {title}
            </h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-1">
              Global Positioning System
            </p>
          </div>
        </div>

        {userPosition && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-black/20 rounded-xl border border-gray-200/50 dark:border-white/5 h-10">
            {[
              { mode: VIEW_MODE.BIKE, label: "Units" },
              { mode: VIEW_MODE.BOTH, label: "Global" },
              { mode: VIEW_MODE.USER, label: "Me" },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                className={`px-3 h-full rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 ${
                  viewMode === mode
                    ? "bg-white dark:bg-[#2a2a2a] text-emerald-500 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                title={`Switch to ${label} View`}
                aria-label={`Switch to ${label} View`}
              >
                <span className="text-sm">
                  {mode === VIEW_MODE.BIKE && (
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
                      <circle cx="5.5" cy="17.5" r="3.5" />
                      <circle cx="18.5" cy="17.5" r="3.5" />
                      <polyline points="15 6 10 6 6 10.5 4.5 13" />
                      <polyline points="19 17.5 19 9 14 3 7.5 3" />
                    </svg>
                  )}
                  {mode === VIEW_MODE.BOTH && (
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
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                      <line x1="8" y1="2" x2="8" y2="18" />
                      <line x1="16" y1="6" x2="16" y2="22" />
                    </svg>
                  )}
                  {mode === VIEW_MODE.USER && (
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </span>
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

MapHeader.propTypes = {
  title: PropTypes.string.isRequired,
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
  userPosition: PropTypes.array,
};

export default MapHeader;
