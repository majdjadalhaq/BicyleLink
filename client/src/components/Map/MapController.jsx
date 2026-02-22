import { useEffect } from "react";
import { useMap } from "react-leaflet";
import PropTypes from "prop-types";
import L from "leaflet";
import {
  VIEW_MODE,
  BIKE_ZOOM,
  USER_ZOOM,
  FIT_BOUNDS_PADDING,
  MAX_ZOOM_ON_FIT,
} from "./mapConstants";

/**
 * An internal Leaflet-aware component that imperatively controls the map view.
 * Must be rendered inside a <MapContainer>.
 */
const MapController = ({ bikePos, userPos, mode }) => {
  const map = useMap();

  useEffect(() => {
    if (mode === VIEW_MODE.BOTH && userPos) {
      const bounds = L.latLngBounds([bikePos, userPos]);
      map.fitBounds(bounds, {
        padding: FIT_BOUNDS_PADDING,
        maxZoom: MAX_ZOOM_ON_FIT,
      });
    } else if (mode === VIEW_MODE.USER && userPos) {
      map.setView(userPos, USER_ZOOM);
    } else {
      map.setView(bikePos, BIKE_ZOOM);
    }
  }, [bikePos, userPos, mode, map]);

  return null;
};

MapController.propTypes = {
  bikePos: PropTypes.arrayOf(PropTypes.number).isRequired,
  userPos: PropTypes.arrayOf(PropTypes.number),
  mode: PropTypes.oneOf(Object.values(VIEW_MODE)).isRequired,
};

export default MapController;
