import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { apiClient } from "../../services/apiClient";

/**
 * Hook for managing administrative reports.
 * Uses TanStack Query for caching and optimistic-style updates.
 */
export const useReports = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const queryKey = ["admin-reports"];

  // Fetch all reports
  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await apiClient.get("/api/admin/reports");
      if (data?.success) {
        return data.reports || [];
      }
      throw new Error(data?.message || "Failed to load reports");
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutation for updating status (resolve/dismiss)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const data = await apiClient.patch(`/api/admin/reports/${id}`, {
        status,
      });
      return data;
    },
    onSuccess: (data, variables) => {
      if (data?.success) {
        // Optimistic cache update
        queryClient.setQueryData(queryKey, (old) =>
          old.map((r) =>
            r._id === variables.id ? { ...r, status: data.report.status } : r,
          ),
        );
        showToast(`Report marked as ${variables.status}`, "success");
      } else {
        showToast(data?.message || "Failed to update report", "error");
      }
    },
    onError: () => {
      showToast("Error updating report status", "error");
    },
  });

  // Mutation for purging (deleting) a report
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const data = await apiClient.delete(`/api/admin/reports/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) =>
          old.filter((r) => r._id !== id),
        );
        showToast("Report record purged", "success");
      } else {
        showToast(data?.message || "Failed to purge report", "error");
      }
    },
    onError: () => {
      showToast("Error connecting to server", "error");
    },
  });

  return {
    reports,
    isLoading,
    error: error?.message,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    deleteReport: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
