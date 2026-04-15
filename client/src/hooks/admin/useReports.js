import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { apiClient } from "../../services/apiClient";

export const useReports = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const queryKey = ["admin-reports"];

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const data = await apiClient.patch(`/api/admin/reports/${id}`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) =>
          old.map((r) => (r._id === variables.id ? { ...r, status: data.report.status } : r))
        );
        showToast(`Report marked as ${variables.status}`, "success");
      }
    },
    onError: () => {
      showToast("Error updating report status", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const data = await apiClient.delete(`/api/admin/reports/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) => old.filter((r) => r._id !== id));
        showToast("Report record purged", "success");
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
