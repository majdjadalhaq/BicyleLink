import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const data = await apiClient.get("/admin/stats");
      if (data?.success) {
        return data.stats;
      }
      throw new Error(data?.msg || "Failed to load admin stats");
    },
    staleTime: 1000 * 60 * 5,
  });
};
