import PropTypes from "prop-types";
import NavItem from "./NavItem";

const AccountSettingsSidebar = ({ user, tabs, activeTab, setActiveTab }) => {
  return (
    <aside className="md:w-60 flex-shrink-0">
      {/* Profile Card */}
      <div className="mb-6 p-5 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-3 mx-auto shadow-lg shadow-emerald-500/20">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <h2 className="text-center text-sm font-black text-gray-900 dark:text-white truncate">
          {user?.name}
        </h2>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {user?.email}
        </p>
      </div>

      <nav className="flex md:flex-col gap-2">
        {tabs.map((tab) => (
          <NavItem
            key={tab.id}
            {...tab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </nav>
    </aside>
  );
};

AccountSettingsSidebar.propTypes = {
  user: PropTypes.object,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default AccountSettingsSidebar;
