import { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";
import "../LocationMap.css";

// Side-effect import
import "./useLeafletIcons";

import { VIEW_MODE, TILE_URL, BIKE_ZOOM } from "./mapConstants";
import MapController from "./MapController";
import DraggableMarker from "./DraggableMarker";
import BikeMarker from "./BikeMarker";
import UserMarker from "./UserMarker";
import useGeolocation from "./useGeolocation";

// Modular sub-components
import MapHeader from "./components/MapHeader";
import MapOverlay from "./components/MapOverlay";

const LocationMap = ({
  coordinates,
  title = "Bike Location",
  draggable = false,
  onLocationChange = null,
  recenterTrigger = 0,
}) => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.BIKE);

  const rawCoords = coordinates
    ? Array.isArray(coordinates)
      ? coordinates
      : coordinates.coordinates
    : null;

  const isValid = rawCoords != null && rawCoords.length === 2;
  const lng = isValid ? rawCoords[0] : 0;
  const lat = isValid ? rawCoords[1] : 0;
  const bikePosition = [lat, lng];

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

  if (!isValid) return null;

  return (
    <div className="location-map-wrapper group/map">
      <MapHeader
        title={title}
        viewMode={viewMode}
        setViewMode={setViewMode}
        userPosition={userPosition}
      />

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
            recenterTrigger={recenterTrigger}
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
          <MapOverlay
            geoError={geoError}
            userDistance={userDistance}
            userPosition={userPosition}
            handleLocate={handleLocate}
            isLocating={isLocating}
            handleOpenInMaps={handleOpenInMaps}
          />
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
  recenterTrigger: PropTypes.number,
};

export default LocationMap;
