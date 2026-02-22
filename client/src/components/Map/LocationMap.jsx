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
  // Compute early so hooks below always receive stable values.
  const rawCoords = coordinates
    ? Array.isArray(coordinates)
      ? coordinates
      : coordinates.coordinates
    : null;

  const isValid = rawCoords != null && rawCoords.length === 2;

  // These must be defined BEFORE any early return (rules-of-hooks).
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
    <div className="location-map-wrapper">
      <div className="location-map-header">
        <h3 className="location-map-title">
          <PinIcon />
          {title}
        </h3>

        {userPosition && (
          <div className="map-view-toggles" role="group" aria-label="Map view">
            {[
              { mode: VIEW_MODE.BIKE, emoji: "🚲", label: "Focus on Bike" },
              { mode: VIEW_MODE.BOTH, emoji: "🗺️", label: "See Both" },
              { mode: VIEW_MODE.USER, emoji: "👤", label: "Focus on Me" },
            ].map(({ mode, emoji, label }) => (
              <button
                key={mode}
                className={`view-toggle-btn${viewMode === mode ? " active" : ""}`}
                onClick={() => setViewMode(mode)}
                title={label}
                aria-pressed={viewMode === mode}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="location-map-container">
        <MapContainer
          center={bikePosition}
          zoom={BIKE_ZOOM}
          scrollWheelZoom={false}
          className="location-map"
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
          <div className="map-overlay-bottom">
            {geoError && <p className="location-map-error">{geoError}</p>}

            {userDistance !== null && (
              <div className="distance-badge">
                <span aria-hidden="true">📍</span>
                <span>{userDistance} km away</span>
              </div>
            )}

            <div className="map-actions-row">
              {!userPosition ? (
                <button
                  className="btn-map-action btn-map-primary"
                  onClick={handleLocate}
                  disabled={isLocating}
                >
                  {isLocating ? "Detecting…" : "📍 Check Distance"}
                </button>
              ) : (
                <button className="btn-map-action" onClick={handleOpenInMaps}>
                  Open in Google Maps
                </button>
              )}
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
