import { useMemo } from "react";
import { Marker, Polyline } from "react-leaflet";
import PropTypes from "prop-types";
import L from "leaflet";
import { USER_DOT_HTML, BIKE_COLOR } from "./mapConstants";

const polylineOptions = {
  color: BIKE_COLOR,
  dashArray: "10, 10",
  weight: 2,
  opacity: 0.6,
};

/**
 * Renders the user's location as a blue dot and a dashed Polyline to the bike.
 */
const UserMarker = ({ userPosition, bikePosition }) => {
  // Memoize the divIcon so it's not recreated on every render
  const userIcon = useMemo(
    () =>
      L.divIcon({
        className: "user-location-marker",
        html: USER_DOT_HTML,
        iconSize: [18, 18],
      }),
    [],
  );

  return (
    <>
      <Marker position={userPosition} icon={userIcon} />
      <Polyline
        positions={[bikePosition, userPosition]}
        pathOptions={polylineOptions}
      />
    </>
  );
};

UserMarker.propTypes = {
  userPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  bikePosition: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default UserMarker;
