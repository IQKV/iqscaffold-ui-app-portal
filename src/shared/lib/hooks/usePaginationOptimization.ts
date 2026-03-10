import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * usePaginationOptimization Hook
 *
 * Optimizes pagination by prefetching adjacent pages and managing cache.
 *
 * Features:
 * - Prefetch next/previous pages for instant navigation
 * - Smart cache management with stale time
 * - Optimistic page transitions
 * - Memory efficient with cache limits
 *
 * Requirements: 13.3
 */

interface UsePaginationOptimizationOptions<T> {
  queryKey: unknown[];
  fetchFn: (page: number) => Promise<T>;
  currentPage: number;
  totalPages: number;
  prefetchPages?: number;
  staleTime?: number;
}

export function usePaginationOptimization<T>({
  queryKey,
  fetchFn,
  currentPage,
  totalPages,
  prefetchPages = 1,
  staleTime = 5 * 60 * 1000, // 5 minutes
}: UsePaginationOptimizationOptions<T>) {
  const queryClient = useQueryClient();

  // Prefetch adjacent pages
  const prefetchAdjacentPages = useCallback(() => {
    const pagesToPrefetch: number[] = [];

    // Prefetch next pages
    for (let i = 1; i <= prefetchPages; i++) {
      const nextPage = currentPage + i;
      if (nextPage <= totalPages) {
        pagesToPrefetch.push(nextPage);
      }
    }

    // Prefetch previous pages
    for (let i = 1; i <= prefetchPages; i++) {
      const prevPage = currentPage - i;
      if (prevPage >= 1) {
        pagesToPrefetch.push(prevPage);
      }
    }

    // Execute prefetch for each page
    pagesToPrefetch.forEach((page) => {
      const pageQueryKey = [...queryKey, { page }];

      // Only prefetch if not already in cache or stale
      const cachedData = queryClient.getQueryData(pageQueryKey);
      if (!cachedData) {
        queryClient.prefetchQuery({
          queryKey: pageQueryKey,
          queryFn: () => fetchFn(page),
          staleTime,
        });
      }
    });
  }, [queryClient, queryKey, fetchFn, currentPage, totalPages, prefetchPages, staleTime]);

  // Get cached page data for instant display
  const getCachedPage = useCallback(
    (page: number) => {
      const pageQueryKey = [...queryKey, { page }];
      return queryClient.getQueryData<T>(pageQueryKey);
    },
    [queryClient, queryKey],
  );

  // Invalidate old pages to free memory
  const cleanupOldPages = useCallback(() => {
    const keepRange = 3; // Keep current page ± 3 pages
    const minPage = Math.max(1, currentPage - keepRange);
    const maxPage = Math.min(totalPages, currentPage + keepRange);

    // Remove pages outside the keep range
    for (let page = 1; page <= totalPages; page++) {
      if (page < minPage || page > maxPage) {
        const pageQueryKey = [...queryKey, { page }];
        queryClient.removeQueries({ queryKey: pageQueryKey });
      }
    }
  }, [queryClient, queryKey, currentPage, totalPages]);

  return {
    prefetchAdjacentPages,
    getCachedPage,
    cleanupOldPages,
  };
}
