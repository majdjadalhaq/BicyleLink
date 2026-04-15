import PropTypes from "prop-types";

/**
 * Reusable UserAvatar component with fallback SVG.
 */
const UserAvatar = ({ user, className }) => {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name || "User"}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`bg-emerald-500/20 flex items-center justify-center ${className}`}
    >
      <svg
        className="w-1/2 h-1/2 text-emerald-500/60"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    </div>
  );
};

UserAvatar.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    name: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default UserAvatar;
