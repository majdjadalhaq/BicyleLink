import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Warning Modal State
  const [selectedUserForWarning, setSelectedUserForWarning] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [isSendingWarning, setIsSendingWarning] = useState(false);

  // View Warnings State
  const [viewingWarningsUser, setViewingWarningsUser] = useState(null);
  const [sentWarnings, setSentWarnings] = useState([]);
  const [isLoadingWarnings, setIsLoadingWarnings] = useState(false);

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { execute } = useApi();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await execute("/api/admin/users", { method: "GET" });
      if (res.success === false) throw new Error(res.message);

      setUsers(res.users);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
      showToast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await execute(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
      });
      if (res.success === false) throw new Error(res.message);

      setUsers(users.map((u) => (u._id === userId ? res.user : u)));
      showToast(
        "success",
        `User ${res.user.isBlocked ? "blocked" : "unblocked"} successfully`,
      );
    } catch (err) {
      console.error("Error toggling block state:", err);
      showToast("error", err.message || "Failed to block/unblock user");
    }
  };

  const handleToggleVerify = async (userId) => {
    try {
      const res = await execute(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
      });
      if (res.success === false) throw new Error(res.message);

      setUsers(users.map((u) => (u._id === userId ? res.user : u)));
      showToast(
        "success",
        `User ${res.user.isVerified ? "verified" : "unverified"} successfully`,
      );
    } catch (err) {
      console.error("Error toggling verification state:", err);
      showToast("error", err.message || "Failed to verify/unverify user");
    }
  };

  const handleToggleRole = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to change this user&apos;s admin privileges?",
      )
    ) {
      try {
        const res = await execute(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
        });
        if (res.success === false) throw new Error(res.message);

        setUsers(users.map((u) => (u._id === userId ? res.user : u)));
        showToast("success", `User role updated to ${res.user.role}`);
      } catch (err) {
        console.error("Error toggling user role:", err);
        showToast("error", err.message || "Failed to change user role");
      }
    }
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim() || !selectedUserForWarning) return;

    try {
      setIsSendingWarning(true);
      const res = await execute(
        `/api/admin/users/${selectedUserForWarning._id}/warn`,
        {
          method: "POST",
          body: { message: warningMessage },
        },
      );

      if (res.success === false) throw new Error(res.message);

      showToast("success", "Warning message sent to user&apos;s inbox.");
      setSelectedUserForWarning(null);
      setWarningMessage("");
    } catch (err) {
      console.error("Error sending warning:", err);
      showToast("error", err.message || "Failed to send warning message.");
    } finally {
      setIsSendingWarning(false);
    }
  };

  const handleViewWarnings = async (user) => {
    setViewingWarningsUser(user);
    setIsLoadingWarnings(true);
    try {
      const res = await execute(
        `/api/admin/users/${user._id}/warnings?t=${Date.now()}`,
        {
          method: "GET",
        },
      );
      if (res.success === false) throw new Error(res.message);
      setSentWarnings(res.warnings || []);
    } catch (err) {
      console.error("Error fetching warnings:", err);
      showToast("error", "Failed to load warning history.");
    } finally {
      setIsLoadingWarnings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading users...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
          User Management
        </h2>
        <div className="text-red-600 dark:text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] space-y-6 bg-light-bg dark:bg-dark-bg">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage community members, block accounts, and assign privileges.
          </p>
        </div>
      </header>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-input/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-light-border dark:border-dark-border">
                <th className="px-6 py-4 font-semibold w-64">Name</th>
                <th className="px-6 py-4 font-semibold w-56">Email</th>
                <th className="px-6 py-4 font-semibold w-24">Role</th>
                <th className="px-6 py-4 font-semibold w-28">Status</th>
                <th className="px-6 py-4 font-semibold w-28">Verified</th>
                <th className="px-6 py-4 font-semibold w-72 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className={`transition-colors group hover:bg-gray-50 dark:hover:bg-dark-surface-hover ${
                    user.isBlocked ? "opacity-70 grayscale" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3e8ff&color=6a1b9a`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
                      />
                      <Link
                        to={`/profile/${user._id}`}
                        className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                        title={user.name}
                      >
                        {user.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm text-gray-600 dark:text-gray-400 truncate block font-medium"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                          : "bg-gray-100 text-gray-600 dark:bg-dark-input dark:text-gray-400 border border-gray-200 dark:border-dark-border"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBlocked
                          ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? "bg-red-500" : "bg-emerald-500"}`}
                      ></span>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.isVerified
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {user.isVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleBlock(user._id)}
                        disabled={user._id === currentUser._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          user.isBlocked
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            : "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => setSelectedUserForWarning(user)}
                        disabled={user._id === currentUser._id}
                        className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send Warning"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleViewWarnings(user)}
                        disabled={user._id === currentUser._id}
                        className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 dark:bg-dark-input dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Warnings History"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleToggleVerify(user._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          user.isVerified
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                        }`}
                      >
                        {user.isVerified ? "Unverify" : "Verify"}
                      </button>
                      <button
                        onClick={() => handleToggleRole(user._id)}
                        disabled={user._id === currentUser._id}
                        className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 dark:bg-dark-input dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-24 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-4"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              No users found.
            </div>
          )}
        </div>
      </div>

      {selectedUserForWarning && (
        <div
          className="overlay-backdrop flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedUserForWarning(null)}
        >
          <div
            className="overlay-panel w-full max-w-lg p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Send Warning to{" "}
                <span className="text-amber-500">
                  {selectedUserForWarning.name}
                </span>
              </h3>
              <button
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-input flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                onClick={() => setSelectedUserForWarning(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendWarning}>
              <div className="mb-6">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-lg mb-4">
                  This message will be sent directly to the user&apos;s Inbox as
                  an official Administrator Notification.
                </p>
                <textarea
                  className="w-full bg-light-input dark:bg-dark-input border border-light-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y min-h-[120px]"
                  placeholder="Enter the warning message here..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  rows={5}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-dark-input dark:hover:bg-dark-border transition-colors text-sm"
                  onClick={() => setSelectedUserForWarning(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingWarning || !warningMessage.trim()}
                >
                  {isSendingWarning ? "Sending..." : "Send Warning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingWarningsUser && (
        <div
          className="overlay-backdrop flex items-center justify-center p-4 z-50"
          onClick={() => setViewingWarningsUser(null)}
        >
          <div
            className="overlay-panel w-full max-w-2xl p-6 flex flex-col max-h-[90vh] animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Warning History:{" "}
                <span className="text-indigo-500">
                  {viewingWarningsUser.name}
                </span>
              </h3>
              <button
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-input flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                onClick={() => setViewingWarningsUser(null)}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
              {isLoadingWarnings ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                    Loading history...
                  </p>
                </div>
              ) : sentWarnings.length === 0 ? (
                <div className="bg-gray-50 dark:bg-dark-input/50 border border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                  No warnings sent to this user. Good behavioral record.
                </div>
              ) : (
                <div className="space-y-4">
                  {sentWarnings.map((warning) => (
                    <div
                      key={warning._id}
                      className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {new Date(warning.createdAt).toLocaleString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {warning.read && (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            Read
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-white dark:bg-dark-surface p-3 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
                        {warning.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-dark-input dark:hover:bg-dark-border transition-colors text-sm"
                onClick={() => setViewingWarningsUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
