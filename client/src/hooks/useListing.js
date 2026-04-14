import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import useToast from "./useToast";
import { useAuth } from "./useAuth";

/**
 * Hook to fetch a single listing by ID.
 * Optimized with initialData from the existing 'listings' cache if available.
 */
export const useListing = (id) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const data = await apiClient(`/api/listings/${id}`);
      return data.result;
    },
    enabled: !!id,
    // Optimization: If the listing is already in the infinite query cache from the Home page,
    // use it as initial data so the page loads instantly.
    initialData: () => {
      // Look through all 'listings' queries in the cache
      const listingsData = queryClient.getQueriesData({ queryKey: ["listings"] });

      for (const [key, data] of listingsData) {
        if (!data?.pages) continue;
        for (const page of data.pages) {
          const listing = page.result.find((l) => l._id === id);
          if (listing) return listing;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      // Find the update time for the 'listings' query we found the data in
      return queryClient.getQueryState(["listings"])?.dataUpdatedAt;
    },
  });
};

/**
 * Hook to fetch potential buyers (candidates) for a listing.
 */
export const useListingCandidates = (id, enabled = false) => {
  return useQuery({
    queryKey: ["listing_candidates", id],
    queryFn: async () => {
      const data = await apiClient(`/api/listings/${id}/candidates`);
      return data?.result || [];
    },
    enabled: !!id && enabled,
  });
};

/**
 * Mutation hook to update a listing status (e.g., mark as sold) with Optimistic UI.
 */
export const useUpdateListingStatus = (id) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ status, buyerId }) => {
      return await apiClient(`/api/listings/${id}/status`, {
        method: "PATCH",
        body: { status, ...(buyerId ? { buyerId } : {}) },
      });
    },

    onMutate: async ({ status, buyerId }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ["listing", id] });

      // Snapshot previous
      const previousListing = queryClient.getQueryData(["listing", id]);

      // Optimistically update
      queryClient.setQueryData(["listing", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          status,
          buyerId: buyerId || old.buyerId,
        };
      });

      return { previousListing };
    },

    onError: (err, variables, context) => {
      if (context?.previousListing) {
        queryClient.setQueryData(["listing", id], context.previousListing);
      }
      showToast("Failed to update status. Please try again.", "error");
    },

    onSuccess: (data) => {
      // Ensure we have the exact server state
      if (data?.listing) {
        queryClient.setQueryData(["listing", id], data.listing);
      }
      showToast(`Listing status updated!`, "success");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      queryClient.invalidateQueries({ queryKey: ["listings"] }); // Sync Home page
    },
  });
};

/**
 * Hook to check if the current user has already reviewed a specific listing.
 */
export const useCheckReview = (listingId) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["has_reviewed", listingId],
    queryFn: async () => {
      const data = await apiClient(`/api/reviews/check?listingId=${listingId}`);
      return data?.hasReviewed || false;
    },
    enabled: !!user && !!listingId,
  });
};

/**
 * Mutation hook to submit a review for a listing.
 */
export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ targetId, listingId, rating, comment }) => {
      return await apiClient("/api/reviews", {
        method: "POST",
        body: { targetId, listingId, rating, comment },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["has_reviewed", variables.listingId],
      });
      showToast("Review submitted successfully!", "success");
    },
    onError: (err) => {
      showToast(err.message || "Failed to submit review", "error");
    },
  });
};

/**
 * Mutation hook to report a listing.
 */
export const useSubmitReport = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ targetId, targetType, reason }) => {
      return await apiClient("/api/reports", {
        method: "POST",
        body: { targetId, targetType, reason },
      });
    },
    onSuccess: () => {
      showToast("Listing reported successfully", "success");
    },
    onError: (err) => {
      showToast(err.message || "Failed to submit report", "error");
    },
  });
};
