
const ProfileSetupHeader = () => {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white mb-6">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
        Welcome to BiCycleL
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
        Let&apos;s finish setting up your profile so you can start trading.
      </p>
    </div>
  );
};

export default ProfileSetupHeader;
