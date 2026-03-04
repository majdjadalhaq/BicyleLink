import { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";
import "../LocationMap.css";

// Side-effect import: sets up the default Leaflet icon globally
import "./useLeafletIcons";

import { VIEW_MODE, TILE_URL, BIKE_ZOOM } from "./mapConstants";
import MapController from "./MapController";
import DraggableMarker from "./DraggableMarker";
import BikeMarker from "./BikeMarker";
import UserMarker from "./UserMarker";
import useGeolocation from "./useGeolocation";

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

const LocationMap = ({
  coordinates,
  title = "Bike Location",
  draggable = false,
  onLocationChange = null,
}) => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.BIKE);

  // Normalise GeoJSON coordinates → [lng, lat]
  const rawCoords = coordinates
    ? Array.isArray(coordinates)
      ? coordinates
      : coordinates.coordinates
    : null;

  const isValid = rawCoords != null && rawCoords.length === 2;

  const lng = isValid ? rawCoords[0] : 0;
  const lat = isValid ? rawCoords[1] : 0;
  const bikePosition = [lat, lng]; // Leaflet expects [lat, lng]

  const {
    position: userPosition,
    distance: userDistance,
    isLocating,
    error: geoError,
    locate,
  } = useGeolocation(lat, lng);

  const handleLocate = useCallback(() => {
    locate();
    setViewMode(VIEW_MODE.BOTH);
  }, [locate]);

  const handleOpenInMaps = useCallback(() => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [lat, lng]);

  const handleDragEnd = useCallback(
    (newCoords) => {
      if (onLocationChange) onLocationChange(newCoords);
    },
    [onLocationChange],
  );

  // Guard: render nothing if coordinates are missing/invalid
  if (!isValid) return null;

  return (
    <div className="location-map-wrapper group/map">
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

      <div className="location-map-container relative rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl">
        <MapContainer
          center={bikePosition}
          zoom={BIKE_ZOOM}
          scrollWheelZoom={false}
          className="location-map h-full w-full"
          attributionControl={false}
        >
          <MapController
            bikePos={bikePosition}
            userPos={userPosition}
            mode={viewMode}
          />
          <TileLayer url={TILE_URL} />

          {draggable ? (
            <DraggableMarker
              position={bikePosition}
              onDragEnd={handleDragEnd}
            />
          ) : (
            <>
              <BikeMarker position={bikePosition} />
              {userPosition && (
                <UserMarker
                  userPosition={userPosition}
                  bikePosition={bikePosition}
                />
              )}
            </>
          )}
        </MapContainer>

        {!draggable && (
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
        )}
      </div>
    </div>
  );
};

LocationMap.propTypes = {
  coordinates: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.shape({ coordinates: PropTypes.arrayOf(PropTypes.number) }),
  ]),
  title: PropTypes.string,
  draggable: PropTypes.bool,
  onLocationChange: PropTypes.func,
};

export default LocationMap;
