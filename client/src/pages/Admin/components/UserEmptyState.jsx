import PropTypes from "prop-types";
import { EmptyUserIcon } from "./AdminIcons";

const UserEmptyState = ({ size = 40 }) => {
  return (
    <div className="py-32 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
        <EmptyUserIcon size={size} strokeWidth="1.5" />
      </div>
      <p className="font-black uppercase tracking-[0.2em] text-xs">
        Zero Agents Detected
      </p>
    </div>
  );
};

UserEmptyState.propTypes = {
  size: PropTypes.number,
};

export default UserEmptyState;
