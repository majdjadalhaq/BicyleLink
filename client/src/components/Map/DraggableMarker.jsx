import { Marker } from "react-leaflet";
import PropTypes from "prop-types";

/**
 * A draggable marker for the seller's listing form preview map.
 * Calls `onDragEnd` with the new [lng, lat] coordinates when dropped.
 */
const DraggableMarker = ({ position, onDragEnd }) => (
  <Marker
    draggable
    eventHandlers={{
      dragend: (e) => {
        const { lat, lng } = e.target.getLatLng();
        onDragEnd([lng, lat]);
      },
    }}
    position={position}
  />
);

DraggableMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default DraggableMarker;
