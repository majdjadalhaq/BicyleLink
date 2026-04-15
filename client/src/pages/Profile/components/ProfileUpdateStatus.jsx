import PropTypes from "prop-types";

const ProfileUpdateStatus = ({ syncStatus }) => {
  if (syncStatus === "idle") return null;

  return (
    <span className="flex items-center gap-1.5 text-emerald-500 ml-2 font-bold text-[10px] uppercase tracking-widest">
      {syncStatus === "saving" ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Saving...
        </>
      ) : (
        <>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Changes Synced
        </>
      )}
    </span>
  );
};

ProfileUpdateStatus.propTypes = {
  syncStatus: PropTypes.string.isRequired,
};

export default ProfileUpdateStatus;
