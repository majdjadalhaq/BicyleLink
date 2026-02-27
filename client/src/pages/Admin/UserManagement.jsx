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

  const handleToggleRole = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to change this user's admin privileges?",
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

      showToast("success", "Warning completed successfully.");
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-xs">
          Scanning User Registry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-12 mt-12 bg-white dark:bg-[#1a1a1a] border border-red-100 dark:border-red-900/20 rounded-[2.5rem] text-center shadow-xl">
        <div className="flex justify-center mb-6 text-red-500">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Registry Error
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          {error}
        </p>
        <button
          onClick={fetchUsers}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          Re-scan Registry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              Command Console
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">
            User Registry
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Manage permissions, status, and integrity of platform citizens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-sm transition-all hover:border-emerald-500 hover:text-emerald-500 shadow-sm"
          >
            ← Back to Terminal
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                  <th className="px-8 py-5 w-72">User</th>
                  <th className="px-8 py-5 w-64">Email</th>
                  <th className="px-8 py-5 w-32 text-center">Role</th>
                  <th className="px-8 py-5 w-32 text-center">Status</th>
                  <th className="px-8 py-5 text-right pr-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className={`transition-all hover:bg-gray-50 dark:hover:bg-white/[0.02] group ${
                      user.isBlocked ? "opacity-60 saturate-50" : ""
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              user.profilePicture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`
                            }
                            alt=""
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-[#2a2a2a] shadow-md group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/profile/${user._id}`}
                            className="font-black text-gray-900 dark:text-white hover:text-emerald-500 transition-colors truncate block text-base"
                          >
                            {user.name}
                          </Link>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 block">
                            {user._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm"
                            : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          user.isBlocked
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
                        ></span>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right pr-12">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleBlock(user._id)}
                          disabled={user._id === currentUser._id}
                          className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 disabled:opacity-20 group/op ${
                            user.isBlocked
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                              : "bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white"
                          }`}
                          title={
                            user.isBlocked
                              ? "Unblock Agent"
                              : "Deactivate Agent"
                          }
                        >
                          <span className="flex-shrink-0">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {user.isBlocked ? (
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              ) : (
                                <>
                                  <circle cx="12" cy="12" r="10" />
                                  <line
                                    x1="4.93"
                                    y1="4.93"
                                    x2="19.07"
                                    y2="19.07"
                                  />
                                </>
                              )}
                            </svg>
                          </span>
                          <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                            {user.isBlocked ? "Unblock" : "Block"}
                          </span>
                        </button>

                        <button
                          onClick={() => setSelectedUserForWarning(user)}
                          disabled={user._id === currentUser._id}
                          className="relative flex items-center h-10 px-3 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-20 group/op"
                          title="Transmit Warning"
                        >
                          <span className="flex-shrink-0">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </span>
                          <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                            Warn
                          </span>
                        </button>

                        <button
                          onClick={() => handleViewWarnings(user)}
                          disabled={user._id === currentUser._id}
                          className="relative flex items-center h-10 px-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-all duration-300 disabled:opacity-20 group/op"
                          title="Dossier History"
                        >
                          <span className="flex-shrink-0">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </span>
                          <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                            History
                          </span>
                        </button>

                        <div className="w-px h-8 bg-gray-100 dark:bg-white/10 mx-1" />

                        <button
                          onClick={() => handleToggleRole(user._id)}
                          disabled={user._id === currentUser._id}
                          className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 disabled:opacity-20 group/op ${
                            user.role === "admin"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                              : "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white"
                          }`}
                          title={
                            user.role === "admin"
                              ? "Demote Specialist"
                              : "Promote to Admin"
                          }
                        >
                          <span className="flex-shrink-0">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </span>
                          <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                            {user.role === "admin" ? "Demote" : "Promote"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className={`bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-[#2a2a2a] p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-xl ${
                user.isBlocked ? "opacity-60 saturate-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={
                        user.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`
                      }
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-[#2a2a2a] shadow-md"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/profile/${user._id}`}
                      className="font-black text-gray-900 dark:text-white hover:text-emerald-500 transition-colors truncate block text-lg"
                    >
                      {user.name}
                    </Link>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 block">
                      ID: {user._id.slice(-6)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role === "admin"
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        : "bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/5"
                    }`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.isBlocked
                        ? "bg-red-500/10 text-red-600 border-red-500/10"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 dark:bg-black/20 rounded-2xl mb-6">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Credentials
                </span>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                  {user.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => handleToggleBlock(user._id)}
                  disabled={user._id === currentUser._id}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    user.isBlocked
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white"
                  } disabled:opacity-20`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {user.isBlocked ? (
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </>
                    )}
                  </svg>
                  <span>{user.isBlocked ? "Unblock" : "Block"}</span>
                </button>

                <button
                  onClick={() => setSelectedUserForWarning(user)}
                  disabled={user._id === currentUser._id}
                  className="flex items-center justify-center gap-2 py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-20"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Warn</span>
                </button>

                <button
                  onClick={() => handleToggleRole(user._id)}
                  disabled={user._id === currentUser._id}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    user.role === "admin"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white"
                  } disabled:opacity-20`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{user.role === "admin" ? "Demote" : "Promote"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="py-32 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-xs">
              Zero Agents Detected
            </p>
          </div>
        )}
      </div>

      {/* Warning Modal */}
      {selectedUserForWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn"
            onClick={() => setSelectedUserForWarning(null)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-[3rem] p-10 shadow-2xl animate-scaleIn border border-white/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />

            <header className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">
                  Protocol: Formal Warning
                </span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  Cautionary Transmission
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForWarning(null)}
                className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleSendWarning} className="space-y-8">
              <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wide">
                  Target Identity:{" "}
                  <span className="font-black text-amber-600 dark:text-amber-200">
                    {selectedUserForWarning.name}
                  </span>
                  <br />
                  This transmission will be logged as an official platform
                  infraction notification.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Message Content
                </label>
                <textarea
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-3xl px-6 py-5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 min-h-[160px] resize-none transition-all"
                  placeholder="Specify findings and required actions..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedUserForWarning(null)}
                  className="flex-1 px-8 py-4 bg-gray-50 dark:bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  disabled={isSendingWarning || !warningMessage.trim()}
                  className="flex-1 px-8 py-4 bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-amber-500/30 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-20"
                >
                  {isSendingWarning ? "Transmitting..." : "Send Transmission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {viewingWarningsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn"
            onClick={() => setViewingWarningsUser(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-[3rem] p-10 shadow-2xl animate-scaleIn border border-white/10 max-h-[85vh] flex flex-col">
            <header className="flex items-center justify-between mb-8 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">
                  Subject: behavioral dossier
                </span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  Historical Archives
                </h3>
              </div>
              <button
                onClick={() => setViewingWarningsUser(null)}
                className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {isLoadingWarnings ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-[10px]">
                    Retrieving Records...
                  </p>
                </div>
              ) : sentWarnings.length === 0 ? (
                <div className="bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem] p-12 text-center text-gray-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                    Pristine Conduct Log
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentWarnings.map((warning) => (
                    <div
                      key={warning._id}
                      className="group p-6 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-3xl transition-all hover:bg-white dark:hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          {new Date(warning.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {warning.read && (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-emerald-500/10">
                            Intercepted
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                        &quot;{warning.content}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <footer className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
              <button
                onClick={() => setViewingWarningsUser(null)}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95"
              >
                Seal Records
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
