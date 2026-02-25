import PropTypes from "prop-types";

const Skeleton = ({ type }) => {
  if (type === "card") {
    return (
      <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl flex flex-col gap-3 border border-light-border dark:border-dark-border animate-pulse">
        <div className="w-full h-48 bg-gray-200 dark:bg-dark-input rounded-xl" />
        <div className="h-5 bg-gray-200 dark:bg-dark-input rounded w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-dark-input rounded w-2/5" />
        <div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-1/2" />
      </div>
    );
  }

  if (type === "inbox") {
    return (
      <div className="bg-light-surface dark:bg-dark-surface p-5 rounded-2xl flex items-center gap-4 border border-light-border dark:border-dark-border animate-pulse">
        <div className="w-14 h-14 bg-gray-200 dark:bg-dark-input rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-gray-200 dark:bg-dark-input rounded w-2/5" />
          <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 dark:bg-dark-input rounded-lg h-4 animate-pulse" />
  );
};

Skeleton.propTypes = {
  type: PropTypes.oneOf(["card", "inbox"]),
};

export default Skeleton;
