const AdminEmptyState = ({
  colSpan = 6,
  message = "No results found",
  icon,
}) => {
  const defaultIcon = (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-32 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-300">
            {icon || defaultIcon}
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {message}
          </p>
        </div>
      </td>
    </tr>
  );
};

export default AdminEmptyState;
