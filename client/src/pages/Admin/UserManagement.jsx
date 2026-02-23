import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";
import "./UserManagement.css";

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

      showToast("success", "Warning message sent to user's inbox.");
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
      <div className="admin-users-container">
        <h2>User Management</h2>
        <div className="admin-loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-container">
        <h2>User Management</h2>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h2>User Management</h2>
        <p>Manage community members, block accounts, and assign privileges.</p>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className={user.isBlocked ? "user-row-blocked" : ""}
              >
                <td className="admin-td-primary">
                  <div className="admin-user-profile-cell">
                    <img
                      src={
                        user.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3e8ff&color=6a1b9a`
                      }
                      alt=""
                      className="admin-user-avatar"
                    />
                    <Link
                      to={`/profile/${user._id}`}
                      className="admin-user-link"
                    >
                      {user.name}
                    </Link>
                  </div>
                </td>
                <td className="admin-td-secondary">{user.email}</td>
                <td>
                  <span className={`admin-badge admin-badge-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`admin-badge admin-badge-${user.isBlocked ? "blocked" : "active"}`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td>
                  <span
                    className={`admin-badge admin-badge-${user.isVerified ? "verified" : "unverified"}`}
                  >
                    {user.isVerified ? "Yes" : "No"}
                  </span>
                </td>
                <td className="admin-actions">
                  <button
                    onClick={() => handleToggleBlock(user._id)}
                    disabled={user._id === currentUser._id}
                    className={`admin-btn ${user.isBlocked ? "admin-btn-outline" : "admin-btn-danger"}`}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => setSelectedUserForWarning(user)}
                    disabled={user._id === currentUser._id}
                    className="admin-btn admin-btn-warning"
                    title="Send Warning"
                  >
                    Warn
                  </button>
                  <button
                    onClick={() => handleViewWarnings(user)}
                    disabled={user._id === currentUser._id}
                    className="admin-btn admin-btn-outline"
                    title="View Warnings History"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleToggleVerify(user._id)}
                    className={`admin-btn ${user.isVerified ? "admin-btn-outline" : "admin-btn-success"}`}
                  >
                    {user.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button
                    onClick={() => handleToggleRole(user._id)}
                    disabled={user._id === currentUser._id}
                    className="admin-btn admin-btn-outline"
                  >
                    {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="admin-empty-state">No users found.</div>
        )}
      </div>

      {selectedUserForWarning && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedUserForWarning(null)}
        >
          <div
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Send Warning to {selectedUserForWarning.name}</h3>
              <button
                className="admin-modal-close"
                onClick={() => setSelectedUserForWarning(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendWarning}>
              <div className="admin-modal-body">
                <p className="admin-modal-subtitle">
                  This message will be sent directly to the user&apos;s Inbox as
                  an official Administrator Notification.
                </p>
                <textarea
                  className="admin-warning-textarea"
                  placeholder="Enter the warning message here..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  rows={5}
                  required
                ></textarea>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setSelectedUserForWarning(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-warning-submit"
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
          className="admin-modal-overlay"
          onClick={() => setViewingWarningsUser(null)}
        >
          <div
            className="admin-modal-content admin-warnings-history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Warning History: {viewingWarningsUser.name}</h3>
              <button
                className="admin-modal-close"
                onClick={() => setViewingWarningsUser(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body admin-history-body">
              {isLoadingWarnings ? (
                <div className="admin-loading">Loading history...</div>
              ) : sentWarnings.length === 0 ? (
                <div className="admin-empty-state">
                  No warnings sent to this user.
                </div>
              ) : (
                <div className="admin-warning-history-list">
                  {sentWarnings.map((warning) => (
                    <div key={warning._id} className="admin-history-item">
                      <div className="admin-history-meta">
                        <span className="admin-history-date">
                          {new Date(warning.createdAt).toLocaleString()}
                        </span>
                        {warning.read && (
                          <span className="admin-history-read">Read</span>
                        )}
                      </div>
                      <p className="admin-history-content">{warning.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
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
