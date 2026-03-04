import PropTypes from "prop-types";
import { Link } from "react-router";

const EmptyState = ({
  title = "No results found",
  message = "Try adjusting your search or filters.",
  icon = "🚲",
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fadeIn">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {message}
      </p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.string,
  actionLabel: PropTypes.string,
  actionLink: PropTypes.string,
};

export default EmptyState;
