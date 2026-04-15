import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";

<<<<<<< HEAD
=======
/**
 * Hook for fetching platform-wide statistics for the admin dashboard.
 */
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
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
<<<<<<< HEAD
    staleTime: 1000 * 60 * 5,
=======
    staleTime: 1000 * 60 * 5, // 5 minutes
>>>>>>> 317c58d (fix/build: include missing admin hooks and components)
  });
};
