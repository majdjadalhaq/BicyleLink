import PropTypes from "prop-types";

// Map colors to tailwind classes
const colorStyles = {
  primary: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  success: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  warning: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  info: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-light-border dark:border-dark-border flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div
        className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center ${colorStyles[color] || colorStyles.primary}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 truncate">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
          {value}
        </p>
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
