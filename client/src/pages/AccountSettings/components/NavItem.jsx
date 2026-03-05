import PropTypes from "prop-types";

const NavItem = ({ id, label, icon, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-bold group ${
        isActive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          isActive
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:text-emerald-500"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
      {isActive && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto text-emerald-500"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
};

NavItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default NavItem;
