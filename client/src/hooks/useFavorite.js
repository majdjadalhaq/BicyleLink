import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import { useAuth } from "./useAuth";
import useToast from "./useToast";

/**
 * Hook to fetch all listing IDs favorited by the current user.
 */
export const useFavoriteIds = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favoriteIds"],
    queryFn: async () => {
      const data = await apiClient("/api/favorites/ids");
      return data?.result || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for managing listing favorites with Optimistic UI updates.
 * This ensures the heart icon toggles instantly while the server syncs.
 */
export const useFavorite = (listingId) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // The backend toggle endpoint handles both add/remove automatically
      return await apiClient(`/api/favorites/${listingId}/toggle`, {
        method: "POST",
      });
    },

    // 1. When the user clicks, cancel outgoing fetches and update UI immediately
    onMutate: async ({ isFavorited }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["listing", listingId] });

      // Snapshot the previous global IDs
      const previousIds = queryClient.getQueryData(["favoriteIds"]);

      // Optimistically update the global IDs list
      queryClient.setQueryData(["favoriteIds"], (old = []) => {
        return isFavorited
          ? old.filter((id) => id !== listingId)
          : [...old, listingId];
      });

      // Snapshot the previous listing (if on Detail page)
      const previousListing = queryClient.getQueryData(["listing", listingId]);

      // Optimistically update the single listing cache
      queryClient.setQueryData(["listing", listingId], (old) => {
        if (!old) return old;
        return {
          ...old,
          isFavorited: !isFavorited,
        };
      });

      // Also optimistically update the infinite 'listings' cache for the Home page
      queryClient.setQueriesData({ queryKey: ["listings"] }, (oldData) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            result: page.result.map((listing) =>
              listing._id === listingId
                ? { ...listing, isFavorited: !isFavorited }
                : listing,
            ),
          })),
        };
      });

      return { previousListing, previousIds };
    },

    // 2. If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousListing) {
        queryClient.setQueryData(
          ["listing", listingId],
          context.previousListing,
        );
      }
      if (context?.previousIds) {
        queryClient.setQueryData(["favoriteIds"], context.previousIds);
      }
      showToast("Could not update favorite. Please try again.", "error");
    },

    // 3. Always refetch after error or success to keep server in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
      queryClient.invalidateQueries({ queryKey: ["favoriteIds"] });
    },
  });
};
