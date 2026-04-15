import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { apiClient } from "../../services/apiClient";

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const queryKey = ["admin-users"];

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await apiClient.get("/admin/users");
      if (data?.success) {
        return data.users || [];
      }
      throw new Error(data?.message || "Failed to load users");
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async (userId) => {
      const data = await apiClient.patch(`/admin/users/${userId}/block`);
      return data;
    },
    onSuccess: (data, userId) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) =>
          old.map((u) => (u._id === userId ? data.user : u))
        );
        showToast(
          `User ${data.user.isBlocked ? "blocked" : "unblocked"} successfully`,
          "success"
        );
      }
    },
    onError: (err) => {
      showToast(err.message || "Failed to block/unblock user", "error");
    },
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async (userId) => {
      const data = await apiClient.patch(`/admin/users/${userId}/role`);
      return data;
    },
    onSuccess: (data, userId) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) =>
          old.map((u) => (u._id === userId ? data.user : u))
        );
        showToast(`User role updated to ${data.user.role}`, "success");
      }
    },
    onError: (err) => {
      showToast(err.message || "Failed to change user role", "error");
    },
  });

  const sendWarningMutation = useMutation({
    mutationFn: async ({ userId, message }) => {
      const data = await apiClient.post(`/admin/users/${userId}/warn`, { message });
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        showToast("Warning completed successfully.", "success");
      }
    },
    onError: (err) => {
      showToast(err.message || "Failed to send warning message.", "error");
    },
  });

  const fetchWarnings = async (userId) => {
    const data = await apiClient.get(`/admin/users/${userId}/warnings?t=${Date.now()}`);
    if (data?.success) {
      return data.warnings || [];
    }
    throw new Error(data?.message || "Failed to load warning history.");
  };

  return {
    users,
    isLoading,
    error: error?.message,
    refetch,
    toggleBlock: toggleBlockMutation.mutate,
    isBlocking: toggleBlockMutation.isPending,
    toggleRole: toggleRoleMutation.mutate,
    isChangingRole: toggleRoleMutation.isPending,
    sendWarning: sendWarningMutation.mutateAsync,
    isSendingWarning: sendWarningMutation.isPending,
    fetchWarnings,
  };
};
