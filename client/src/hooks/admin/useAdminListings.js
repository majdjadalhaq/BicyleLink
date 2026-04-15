import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../useToast";
import { apiClient } from "../../services/apiClient";

export const useAdminListings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const queryKey = ["admin-listings"];

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await apiClient.get("/admin/listings");
      if (data?.success) {
        return data.listings || [];
      }
      throw new Error(data?.msg || "Failed to load listings");
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id) => {
      const data = await apiClient.patch(`/admin/listings/${id}/featured`);
      return data;
    },
    onSuccess: (data, id) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) =>
          old.map((l) =>
            l._id === id ? { ...l, isFeatured: data.listing.isFeatured } : l
          )
        );
        showToast(`Listing updated successfully`, "success");
      }
    },
    onError: () => {
      showToast("Failed to toggle featured status", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const data = await apiClient.delete(`/admin/listings/${id}`);
      return data;
    },
    onSuccess: (data, id) => {
      if (data?.success) {
        queryClient.setQueryData(queryKey, (old) => old.filter((l) => l._id !== id));
        showToast("Listing record purged successfully", "success");
      }
    },
    onError: () => {
      showToast("Error connecting to server", "error");
    },
  });

  return {
    listings,
    isLoading,
    error: error?.message,
    refetch,
    toggleFeatured: toggleFeaturedMutation.mutate,
    isToggling: toggleFeaturedMutation.isPending,
    deleteListing: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
