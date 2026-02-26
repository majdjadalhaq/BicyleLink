import PropTypes from "prop-types";

const BicycleLoading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-6 animate-in fade-in duration-700">
      <div className="relative w-24 h-24">
        {/* Bicycle Frame */}
        <div className="absolute inset-0 flex items-center justify-center animate-pedal">
          <svg
            width="60"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600 dark:text-emerald-500"
          >
            <circle
              cx="5.5"
              cy="17.5"
              r="3.5"
              className="animate-spin-slow origin-[5.5px_17.5px]"
            />
            <circle
              cx="18.5"
              cy="17.5"
              r="3.5"
              className="animate-spin-slow origin-[18.5px_17.5px]"
            />
            <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-2-2m6 1V14l-2-2m0 0l-2-4 3-2" />
          </svg>
        </div>

        {/* Road line */}
        <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-emerald-500/50 rounded-full animate-shimmer" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-gray-900 dark:text-white font-bold tracking-tight text-lg">
          {message}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
          Gearing up for your ride...
        </p>
      </div>
    </div>
  );
};

BicycleLoading.propTypes = {
  message: PropTypes.string,
};

export default BicycleLoading;
