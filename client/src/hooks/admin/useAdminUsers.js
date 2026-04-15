import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { apiClient } from "../../services/apiClient";

<<<<<<< HEAD
export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const queryKey = ["admin-users"];

=======
/**
 * Hook for managing platform users from the admin console.
 */
export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const queryKey = ["admin-users"];

  // Fetch all users for admin view
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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

<<<<<<< HEAD
=======
  // Mutation for toggling block state
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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

<<<<<<< HEAD
=======
  // Mutation for toggling role
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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

<<<<<<< HEAD
=======
  // Mutation for sending a warning
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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

<<<<<<< HEAD
=======
  // Query for fetching warnings (this is often one-off, but can be a query)
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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
<<<<<<< HEAD
    sendWarning: sendWarningMutation.mutateAsync,
=======
    sendWarning: sendWarningMutation.mutateAsync, // mutationAsync for form handling
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
    isSendingWarning: sendWarningMutation.isPending,
    fetchWarnings,
  };
};
