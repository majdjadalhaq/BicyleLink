import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

/**
 * Hook to fetch all notifications for the current user.
 */
export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await apiClient("/api/notifications");
      return data?.result || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch the unread notification count.
 */
export const useUnreadCountQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const data = await apiClient("/api/notifications/unread-count");
      return data?.result || 0;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Mutation to mark a single notification as read.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old) => {
        if (!old) return old;
        return old.map((n) => (n._id === id ? { ...n, read: true } : n));
      });

      // Update unread count optimistically
      queryClient.setQueryData(["notifications", "unread-count"], (prev) => Math.max((prev || 0) - 1, 0));

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Mutation to mark all notifications as read.
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      return await apiClient("/api/notifications/read-all", {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (old) => {
        if (!old) return old;
        return old.map((n) => ({ ...n, read: true }));
      });
      queryClient.setQueryData(["notifications", "unread-count"], 0);
      showToast("All notifications marked as read", "success");
    },
    onError: () => {
      showToast("Failed to mark notifications as read", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
