import { useState } from "react";
import PropTypes from "prop-types";

const ExpandableSection = ({ title, subtitle, icon, children, danger }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        danger
          ? "border-red-200 dark:border-red-500/20"
          : "border-gray-100 dark:border-white/5"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${
          danger
            ? "hover:bg-red-50 dark:hover:bg-red-500/5"
            : "hover:bg-gray-50 dark:hover:bg-white/5"
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            danger
              ? "bg-red-500/10 text-red-500 border border-red-500/20"
              : "bg-gray-100 dark:bg-white/5 text-emerald-500 border border-gray-200 dark:border-white/5"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-black ${danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
          >
            {title}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-6 border-t border-gray-100 dark:border-white/5 pt-5 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

ExpandableSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  danger: PropTypes.bool,
};

export default ExpandableSection;
