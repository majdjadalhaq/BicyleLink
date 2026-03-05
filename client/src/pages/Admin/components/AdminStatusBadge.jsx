const variants = {
  active:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10",
  blocked: "bg-red-500/10 text-red-600 border border-red-500/10",
  admin: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
  user: "bg-gray-100 dark:bg-white/5 text-gray-500 border border-transparent",
  pending:
    "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  resolved:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]",
  dismissed:
    "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/5",
  listing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  profile: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  featured:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  standard: "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500",
  sold: "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400",
};

const AdminStatusBadge = ({
  label,
  variant = "active",
  pulse = false,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${variants[variant] || variants.active} ${className}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "pending"
              ? "bg-amber-500 animate-pulse"
              : variant === "resolved"
                ? "bg-emerald-500"
                : variant === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-gray-500"
          }`}
        />
      )}
      {label}
    </span>
  );
};

export default AdminStatusBadge;
