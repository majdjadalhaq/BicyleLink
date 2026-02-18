import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/EmptyState.css";

const EmptyState = ({
  title = "No results found",
  message = "Try adjusting your search or filters.",
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">🚲</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-message">{message}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="empty-state-action btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  actionLink: PropTypes.string,
};

export default EmptyState;
