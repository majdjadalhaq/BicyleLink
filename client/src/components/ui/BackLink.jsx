import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const BackLink = ({ to, label = "Back", className = "" }) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-colors group mb-6 ${className}`}
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label}
    </Link>
  );
};

BackLink.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default BackLink;
