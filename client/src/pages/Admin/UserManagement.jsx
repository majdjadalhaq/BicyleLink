import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useAdminUsers } from "../../hooks/admin/useAdminUsers";
import AdminLoadingState from "./components/AdminLoadingState";
import AdminErrorState from "./components/AdminErrorState";
import AdminPageHeader, { BackToAdminLink } from "./components/AdminPageHeader";
import WarningModal from "./components/WarningModal";
import WarningHistoryModal from "./components/WarningHistoryModal";
import UserDesktopTable from "./components/UserDesktopTable";
import UserMobileCards from "./components/UserMobileCards";
import UserEmptyState from "./components/UserEmptyState";

const UserManagement = () => {
  const {
    users,
    isLoading,
    error,
    refetch,
    toggleBlock,
    toggleRole,
    sendWarning,
    isSendingWarning,
    fetchWarnings,
  } = useAdminUsers();

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // Warning Modal State
  const [selectedUserForWarning, setSelectedUserForWarning] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  // View Warnings State
  const [viewingWarningsUser, setViewingWarningsUser] = useState(null);
  const [sentWarnings, setSentWarnings] = useState([]);
  const [isLoadingWarnings, setIsLoadingWarnings] = useState(false);

  const handleToggleBlock = (userId) => toggleBlock(userId);

  const handleToggleRole = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to change this user's admin privileges?",
      )
    ) {
      toggleRole(userId);
    }
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim() || !selectedUserForWarning) return;

    try {
      await sendWarning({
        userId: selectedUserForWarning._id,
        message: warningMessage,
      });
      setSelectedUserForWarning(null);
      setWarningMessage("");
    } catch {
      // Error handled by hook toast
    }
  };

  const handleViewWarnings = async (user) => {
    setViewingWarningsUser(user);
    setIsLoadingWarnings(true);
    try {
      const data = await fetchWarnings(user._id);
      setSentWarnings(data);
    } catch {
      showToast("Failed to load warning history.", "error");
    } finally {
      setIsLoadingWarnings(false);
    }
  };

  const commonProps = {
    users,
    currentUser,
    handleToggleBlock,
    setSelectedUserForWarning,
    handleViewWarnings,
    handleToggleRole,
  };

  if (isLoading) {
    return (
      <AdminLoadingState message="Scanning User Registry..." color="emerald" />
    );
  }

  if (error) {
    return (
      <AdminErrorState
        error={error}
        onRetry={refetch}
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
        <UserDesktopTable {...commonProps} />
        <UserMobileCards {...commonProps} />
        {users.length === 0 && <UserEmptyState />}
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
