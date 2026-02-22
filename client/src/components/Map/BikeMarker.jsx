import { Marker, Circle } from "react-leaflet";
import PropTypes from "prop-types";
import { BIKE_CIRCLE_RADIUS, BIKE_COLOR } from "./mapConstants";

const circleOptions = {
  fillColor: BIKE_COLOR,
  color: BIKE_COLOR,
  fillOpacity: 0.1,
};

/**
 * Renders the bike's location marker and a privacy radius circle.
 */
const BikeMarker = ({ position }) => (
  <Marker position={position}>
    <Circle
      center={position}
      pathOptions={circleOptions}
      radius={BIKE_CIRCLE_RADIUS}
    />
  </Marker>
);

BikeMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default BikeMarker;
