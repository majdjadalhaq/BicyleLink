import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { apiClient } from "../../services/apiClient";

<<<<<<< HEAD
export const useReports = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const queryKey = ["admin-reports"];

=======
/**
 * Hook for managing administrative reports.
 * Uses TanStack Query for caching and optimistic-style updates.
 */
export const useReports = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const queryKey = ["admin-reports"];

  // Fetch all reports
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
  const { data: reports = [], isLoading, error, refetch } = useQuery({
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

<<<<<<< HEAD
=======
  // Mutation for updating status (resolve/dismiss)
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const data = await apiClient.patch(`/api/admin/reports/${id}`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      if (data?.success) {
<<<<<<< HEAD
=======
        // Optimistic cache update
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
        queryClient.setQueryData(queryKey, (old) =>
          old.map((r) => (r._id === variables.id ? { ...r, status: data.report.status } : r))
        );
        showToast(`Report marked as ${variables.status}`, "success");
<<<<<<< HEAD
=======
      } else {
        showToast(data?.message || "Failed to update report", "error");
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
      }
    },
    onError: () => {
      showToast("Error updating report status", "error");
    },
  });

<<<<<<< HEAD
=======
  // Mutation for purging (deleting) a report
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const data = await apiClient.delete(`/api/admin/reports/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) => old.filter((r) => r._id !== id));
        showToast("Report record purged", "success");
<<<<<<< HEAD
=======
      } else {
        showToast(data?.message || "Failed to purge report", "error");
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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
