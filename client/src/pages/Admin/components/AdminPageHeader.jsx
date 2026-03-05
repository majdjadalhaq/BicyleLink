import { Link } from "react-router";

const AdminPageHeader = ({
  badge,
  badgeColor = "emerald",
  title,
  subtitle,
  showPulse = false,
  children,
}) => {
  const badgeColors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  const pulseColors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  };

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-white/5">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`px-3 py-1 ${badgeColors[badgeColor] || badgeColors.emerald} text-[10px] font-black uppercase tracking-widest rounded-full border`}
          >
            {badge}
          </span>
          {showPulse && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${pulseColors[badgeColor] || pulseColors.emerald} animate-pulse`}
            />
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">
          {title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
};

export const BackToAdminLink = ({
  label = "← Command Center",
  color = "emerald",
}) => {
  const hoverColors = {
    emerald: "hover:border-emerald-500 hover:text-emerald-500",
    amber: "hover:border-amber-500 hover:text-amber-500",
  };

  return (
    <Link
      to="/admin"
      className={`px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-sm transition-all ${hoverColors[color] || hoverColors.emerald} shadow-sm whitespace-nowrap`}
    >
      {label}
    </Link>
  );
};

export default AdminPageHeader;
