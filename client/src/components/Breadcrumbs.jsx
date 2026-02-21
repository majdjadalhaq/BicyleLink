import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/Breadcrumbs.css";

/**
 * Breadcrumbs component that accepts a list of items for navigation.
 * Each item should have a label and a path.
 */
const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="breadcrumb" className="breadcrumb-nav">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={item.path || index}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? (
                  <span>{item.label}</span>
                ) : (
                  <Link to={item.path}>{item.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    }),
  ),
};

export default Breadcrumbs;
