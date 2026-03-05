const AdminLoadingState = ({ message = "Loading...", color = "emerald" }) => {
  const borderColor = {
    emerald: "border-emerald-500/20 border-t-emerald-500",
    amber: "border-amber-500/20 border-t-amber-500",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div
        className={`w-16 h-16 border-4 ${borderColor[color] || borderColor.emerald} rounded-full animate-spin`}
      ></div>
      <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-xs">
        {message}
      </p>
    </div>
  );
};

export default AdminLoadingState;
