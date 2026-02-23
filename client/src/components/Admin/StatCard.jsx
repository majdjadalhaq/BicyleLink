import PropTypes from "prop-types";
import "./StatCard.css";

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <h3 className="stat-card__title">{title}</h3>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(["primary", "success", "warning", "info"]),
};

StatCard.defaultProps = {
  color: "primary",
};

export default StatCard;
