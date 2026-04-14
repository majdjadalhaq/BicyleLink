import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import { useAuth } from "./useAuth";

/**
 * Hook to fetch the total unread message count for the current user.
 * Managed by TanStack Query for optimal polling and caching.
 */
export const useUnreadMessagesCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", "unread-total"],
    queryFn: async () => {
      const data = await apiClient("/api/messages/unread-total");
      return data?.result || 0;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every minute as fallback
  });
};
