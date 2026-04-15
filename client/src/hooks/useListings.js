import { useInfiniteQuery } from "@tanstack/react-query";
import { fetcher } from "../services/apiClient";

/**
 * Hook for fetching listings with infinite scroll support
 * @param {object} filters - Filter parameters (search, category, price, etc.)
 */
export const useListings = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ["listings", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: "12",
        search: filters.search || "",
      });

      if (filters.minPrice != null)
        params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice != null)
        params.set("maxPrice", String(filters.maxPrice));
      if (filters.minYear != null)
        params.set("minYear", String(filters.minYear));
      if (filters.maxYear != null)
        params.set("maxYear", String(filters.maxYear));

      const cats = filters.category?.length ? filters.category : [];
      if (cats.length) params.set("category", cats.join(","));

      if (filters.condition?.length)
        params.set("condition", filters.condition.join(","));
      if (filters.location) params.set("location", filters.location);
      if (filters.lat) params.set("lat", filters.lat);
      if (filters.lng) params.set("lng", filters.lng);
      if (filters.radius) params.set("radius", filters.radius);
      if (filters.sort) params.set("sort", filters.sort);

      return fetcher(`/listings?${params.toString()}`);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
