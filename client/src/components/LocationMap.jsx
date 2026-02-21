import { MapContainer, TileLayer, Circle } from "react-leaflet";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";
import "./LocationMap.css";
import L from "leaflet";

// Fix vector icon issue with Leaflet in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = ({ coordinates }) => {
  // coordinates are usually [longitude, latitude] from MongoDB GeoJSON
  if (!coordinates || coordinates.length !== 2) return null;

  const [lng, lat] = coordinates;
  const position = [lat, lng]; // Leaflet uses [lat, lng]

  return (
    <div className="location-map-wrapper">
      <h3 className="location-map-title">Location</h3>
      <div className="location-map-container">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="location-map"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle
            center={position}
            pathOptions={{
              fillColor: "var(--primary-color)",
              color: "var(--primary-color)",
            }}
            radius={800}
          />
        </MapContainer>
      </div>
    </div>
  );
};

LocationMap.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number),
};

export default LocationMap;
