import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";
import AdminLoadingState from "./components/AdminLoadingState";
import AdminErrorState from "./components/AdminErrorState";
import AdminPageHeader, { BackToAdminLink } from "./components/AdminPageHeader";
import WarningModal from "./components/WarningModal";
import WarningHistoryModal from "./components/WarningHistoryModal";
import {
  BlockIcon,
  UnblockIcon,
  WarnIcon,
  HistoryIcon,
  StarIcon,
  PromoteIcon,
  EmptyUserIcon,
} from "./components/AdminIcons";

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
      <AdminLoadingState message="Scanning User Registry..." color="emerald" />
    );
  }

  if (error) {
    return (
      <AdminErrorState
        error={error}
        onRetry={fetchUsers}
        title="Registry Error"
        buttonText="Re-scan Registry"
        color="red"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      <AdminPageHeader
        badge="Command Console"
        badgeColor="emerald"
        title="User Registry"
        subtitle="Manage permissions, status, and integrity of platform citizens."
      >
        <BackToAdminLink label="← Back to Terminal" color="emerald" />
      </AdminPageHeader>

      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative">
          <table className="w-full text-left border-collapse">
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
                            user.avatarUrl ||
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
                          user.isBlocked ? "Unblock Agent" : "Deactivate Agent"
                        }
                      >
                        <span className="flex-shrink-0">
                          {user.isBlocked ? <UnblockIcon /> : <BlockIcon />}
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
                          <WarnIcon />
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
                          <HistoryIcon />
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
                          <StarIcon />
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
                        user.avatarUrl ||
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
                  {user.isBlocked ? (
                    <UnblockIcon size={14} />
                  ) : (
                    <BlockIcon size={14} />
                  )}
                  <span>{user.isBlocked ? "Unblock" : "Block"}</span>
                </button>

                <button
                  onClick={() => setSelectedUserForWarning(user)}
                  disabled={user._id === currentUser._id}
                  className="flex items-center justify-center gap-2 py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-20"
                >
                  <WarnIcon size={14} />
                  <span>Warn</span>
                </button>

                <button
                  onClick={() => handleViewWarnings(user)}
                  disabled={user._id === currentUser._id}
                  className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-20"
                >
                  <HistoryIcon size={14} />
                  <span>History</span>
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
                  <PromoteIcon size={14} />
                  <span>{user.role === "admin" ? "Demote" : "Promote"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="py-32 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
              <EmptyUserIcon size={40} strokeWidth="1.5" />
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-xs">
              Zero Agents Detected
            </p>
          </div>
        )}
      </div>

      <WarningModal
        user={selectedUserForWarning}
        warningMessage={warningMessage}
        onMessageChange={setWarningMessage}
        onSubmit={handleSendWarning}
        onClose={() => setSelectedUserForWarning(null)}
        isSending={isSendingWarning}
      />

      <WarningHistoryModal
        user={viewingWarningsUser}
        warnings={sentWarnings}
        isLoading={isLoadingWarnings}
        onClose={() => setViewingWarningsUser(null)}
      />
    </div>
  );
};

export default UserManagement;
