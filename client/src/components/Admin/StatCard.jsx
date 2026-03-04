import PropTypes from "prop-types";

// Map colors to tailwind classes
const colorStyles = {
  primary: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  success: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  info: "text-purple-500 bg-purple-500/10 border-purple-500/20",
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-7 rounded-3xl shadow-sm border border-gray-100 dark:border-[#2a2a2a] flex items-center gap-6 transition-all hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-none hover:-translate-y-1 group">
      <div
        className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center border-2 ${
          colorStyles[color] || colorStyles.primary
        } transition-all group-hover:scale-110`}
      >
        <div className="scale-110">{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1.5 truncate">
          {title}
        </p>
        <p className="text-3xl font-black text-gray-900 dark:text-white truncate tracking-tighter">
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
